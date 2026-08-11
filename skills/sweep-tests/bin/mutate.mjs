#!/usr/bin/env node
// Targeted mutation check for the sweep-tests skill.
// Breaks one function on purpose and reports which breaks the suite fails to
// catch. A surviving mutant is a behaviour that no test covers.
// No dependencies. Node 18 or later.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { basename } from 'node:path';

const OPERATORS = [
  { id: 'boundary-lt', find: /([^<>=!])<(?!=)/g, put: '$1<=' },
  { id: 'boundary-gt', find: /([^<>=!])>(?!=)/g, put: '$1>=' },
  { id: 'boundary-lte', find: /<=/g, put: '<' },
  { id: 'boundary-gte', find: />=/g, put: '>' },
  { id: 'equality', find: /===/g, put: '!==' },
  { id: 'logic-and', find: /&&/g, put: '||' },
  { id: 'logic-or', find: /\|\|/g, put: '&&' },
  { id: 'arith-minus', find: /([\w.]+|\)) - ([\w.]+|\()/g, put: '$1 + $2' },
  { id: 'arith-plus', find: /([\w.]+|\)) \+ ([\w.]+|\()/g, put: '$1 - $2' },
  { id: 'arith-div', find: /([\w.]+|\)) \/ ([\w.]+|\()/g, put: '$1 * $2' },
  { id: 'minmax', find: /Math\.max/g, put: 'Math.min' },
  { id: 'bool-true', find: /return true/g, put: 'return false' },
  { id: 'bool-false', find: /return false/g, put: 'return true' },
  { id: 'literal-number', find: /\b(\d+)\b/g, put: (m) => String(Number(m) + 1) },
  { id: 'ternary-flip', find: /\? '([^']*)' : '([^']*)'/g, put: "? '$2' : '$1'", onText: true },
];

// Blanks out the inside of strings, template literals, and comments, keeping
// every index aligned with the source. Operators run against this, so a date
// such as '2026-12-31' never reports as uncovered behaviour.
function maskText(source) {
  return source.replace(
    /'[^'\n]*'|"[^"\n]*"|`[^`]*`|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (match) => match[0] + ' '.repeat(match.length - 2) + match[match.length - 1],
  );
}

function parseArgs(argv) {
  const out = { test: 'npm test', max: 40 };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inline] = argv[i].split('=');
    const value = inline ?? argv[i + 1];
    if (flag === '--file') { out.file = value; if (!inline) i += 1; }
    else if (flag === '--fn') { out.fn = value; if (!inline) i += 1; }
    else if (flag === '--test') { out.test = value; if (!inline) i += 1; }
    else if (flag === '--max') { out.max = Number(value); if (!inline) i += 1; }
  }
  return out;
}

// Returns [start, end] of the function body, or the whole file when no name is
// given. Brace matching is good enough for a source file that already parses.
function region(source, name) {
  if (!name) return [0, source.length];
  const decl = new RegExp(`(?:function\\s+${name}\\b|(?:const|let|var)\\s+${name}\\s*=)`);
  const hit = decl.exec(source);
  if (!hit) {
    console.error(`Cannot find ${name} in the file. Drop --fn to mutate all of it.`);
    process.exit(2);
  }
  // Step past the parameter list first. A default such as `deps = {}` holds a
  // brace, and starting there would treat the default as the whole body.
  let open = source.indexOf('{', hit.index);
  const lparen = source.indexOf('(', hit.index);
  if (lparen !== -1 && lparen < open) {
    let parens = 0;
    for (let i = lparen; i < source.length; i += 1) {
      if (source[i] === '(') parens += 1;
      else if (source[i] === ')') {
        parens -= 1;
        if (parens === 0) { open = source.indexOf('{', i); break; }
      }
    }
  }
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') { depth -= 1; if (depth === 0) return [open, i + 1]; }
  }
  return [open, source.length];
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

function buildMutants(source, [from, to], limit) {
  const mutants = [];
  const scope = source.slice(from, to);
  const masked = maskText(source).slice(from, to);
  for (const op of OPERATORS) {
    op.find.lastIndex = 0;
    const haystack = op.onText ? scope : masked;
    let hit;
    while ((hit = op.find.exec(haystack)) !== null) {
      const replaced = typeof op.put === 'function'
        ? op.put(hit[0])
        : hit[0].replace(new RegExp(op.find.source), op.put);
      if (replaced === hit[0]) continue;
      const at = from + hit.index;
      mutants.push({
        id: op.id,
        line: lineOf(source, at),
        was: hit[0].trim(),
        now: replaced.trim(),
        mutated: source.slice(0, at) + replaced + source.slice(at + hit[0].length),
      });
      if (op.find.lastIndex === hit.index) op.find.lastIndex += 1;
    }
  }
  return mutants.slice(0, limit);
}

// A test command such as `node --test test/*.test.js` needs a shell for the
// glob. A command such as `npm test` does not. Use a shell only when the
// command contains shell syntax, so the common case never builds a shell string.
const SHELL_SYNTAX = /[;&|<>$`(){}[\]!*?~\n]/;

function suitePasses(command) {
  try {
    if (SHELL_SYNTAX.test(command)) {
      execSync(command, { stdio: 'ignore' });
    } else {
      const [bin, ...rest] = command.split(/\s+/).filter(Boolean);
      execFileSync(bin, rest, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

const args = parseArgs(process.argv.slice(2));
if (!args.file) {
  console.error('Usage: mutate.mjs --file <path> [--fn <name>] [--test "npm test"] [--max N]');
  process.exit(2);
}

const original = readFileSync(args.file, 'utf8');
const restore = () => writeFileSync(args.file, original);
process.on('SIGINT', () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });

if (!suitePasses(args.test)) {
  restore();
  console.error('The suite is red before any mutation. Fix that first.');
  console.error('A mutation check on a red suite tells you nothing.');
  process.exit(2);
}

const mutants = buildMutants(original, region(original, args.fn), args.max);
if (mutants.length === 0) {
  console.error('No mutable expression found in that scope.');
  process.exit(2);
}

const target = args.fn ? `${basename(args.file)}:${args.fn}` : basename(args.file);
console.log(`\nMutating ${target} (${mutants.length} mutants, suite: ${args.test})\n`);

const survivors = [];
try {
  for (const mutant of mutants) {
    writeFileSync(args.file, mutant.mutated);
    const survived = suitePasses(args.test);
    restore();
    if (survived) survivors.push(mutant);
    const mark = survived ? 'SURVIVED' : '  killed';
    console.log(`  ${mark}  line ${String(mutant.line).padStart(3)}  ${mutant.was}  ->  ${mutant.now}`);
  }
} finally {
  restore();
}

const killed = mutants.length - survivors.length;
const score = Math.round((killed / mutants.length) * 100);
console.log(`\nDetection: ${killed}/${mutants.length} mutants killed (${score}%)`);

if (survivors.length > 0) {
  console.log('\nUncovered behaviour. Every line below is a defect your suite ships:');
  for (const s of survivors) console.log(`  line ${s.line}: ${s.was} -> ${s.now}`);
  console.log('\nWrite one test per survivor, or accept the gap on purpose.');
  process.exit(1);
}

console.log('\nNo survivors. Every mutation in this scope breaks a test.');
