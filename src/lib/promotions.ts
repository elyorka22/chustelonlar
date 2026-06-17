export function isPromotionActive(
  flag: boolean,
  until: Date | null | undefined
): boolean {
  if (!flag) return false;
  if (!until) return flag;
  return new Date(until) > new Date();
}
