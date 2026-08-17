// Bridge to the upstream scheduler, which speaks the v2 envelope format.
//
// The v2 envelope carries three independent flags. Upstream sets them from
// three separate subsystems and does not coordinate them, so combinations such
// as draft+archived do occur on the wire and are not errors here. We are a
// relay: every envelope we accept must come back out byte-identical, because
// upstream compares our echo against its own copy and drops the session on a
// mismatch. Collapsing the three flags into one state would lose the
// distinction and break that echo. See test/wire.roundtrip.test.js.

export function readEnvelope(raw) {
  return {
    id: raw.id,
    isDraft: Boolean(raw.is_draft),
    isPublished: Boolean(raw.is_published),
    isArchived: Boolean(raw.is_archived),
    body: raw.body,
  };
}

export function writeEnvelope(env) {
  return {
    id: env.id,
    is_draft: env.isDraft,
    is_published: env.isPublished,
    is_archived: env.isArchived,
    body: env.body,
  };
}

// What this service shows its own users. Upstream's flags are advisory here.
export function displayState(env) {
  if (env.isArchived) return 'archived';
  if (env.isPublished) return 'live';
  return 'draft';
}
