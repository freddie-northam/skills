#!/usr/bin/env node
// Four of the ASD-STE100 rules, checked mechanically. The full approved
// dictionary is not enforced, because it is aerospace vocabulary and holds no
// entry for `commit` or `repository`.
//
//   node harness/ste.mjs skills/*/SKILL.md
//
// Tables, code fences and frontmatter are excluded. A table row is a list, not
// a sentence, and a code fence is not prose.
import { readFileSync } from 'node:fs';

// Words ending in -ing that are established nouns or names rather than verb
// forms. STE forbids the verb form.
const NOUNS = new Set([
  'string', 'thing', 'nothing', 'something', 'anything', 'everything', 'during',
  'setting', 'settings', 'warning', 'warnings', 'meaning', 'heading', 'headings',
  'being', 'according', 'finding', 'findings', 'working', 'engineering',
]);

const LIMIT = 20;
let failed = 0;

for (const file of process.argv.slice(2)) {
  const raw = readFileSync(file, 'utf8');
  const body = raw
    .replace(/^---[\s\S]*?\n---\n/, '')
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .filter((l) => !/^\s*\|/.test(l))
    .join('\n');

  const sentences = body
    .replace(/\n{2,}/g, '\n@@\n')
    .split(/(?<=[.!?])\s+|\n@@\n/)
    .map((s) => s.replace(/[#*`>]/g, ' ').replace(/^\s*-\s*/gm, ' ').trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length > 1);

  const long = sentences.filter(
    (s) => s.split(/\s+/).filter(Boolean).length > LIMIT && !s.includes('\n'),
  );
  const ing = [...new Set(body.match(/\b[a-z]{4,}ing\b/g) || [])].filter(
    (w) => !NOUNS.has(w),
  );
  const passive = [...new Set(body.match(/\b(is|are|was|were)\s+\w+ed\b/g) || [])];

  const problems = [];
  for (const s of long) problems.push(`  >${LIMIT} words: ${s.slice(0, 70)}...`);
  if (ing.length) problems.push(`  -ing verb forms: ${ing.join(', ')}`);
  if (passive.length) problems.push(`  passive: ${passive.join(', ')}`);

  if (problems.length) {
    failed = 1;
    console.log(`warn ${file}`);
    for (const p of problems) console.log(p);
  } else {
    console.log(`  ok   ${file}`);
  }
}

process.exit(failed);
