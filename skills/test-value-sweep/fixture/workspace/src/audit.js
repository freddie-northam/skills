// Records pricing decisions. Production always uses consoleAuditLog.
export function consoleAuditLog() {
  return {
    record(event, detail) {
      console.log(`[audit] ${event} ${JSON.stringify(detail)}`);
    },
  };
}
