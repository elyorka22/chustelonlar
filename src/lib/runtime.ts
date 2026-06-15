/**
 * True during `next build` static generation phase.
 * Used to skip optional runtime services (Redis) at build time.
 */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
