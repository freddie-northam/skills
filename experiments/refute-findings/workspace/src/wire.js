// Bridge to the upstream scheduler.

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

export function displayState(env) {
  if (env.isArchived) return 'archived';
  if (env.isPublished) return 'live';
  return 'draft';
}
