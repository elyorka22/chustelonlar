const DEFAULT_SITE_URL = "https://chust-elonlar.uz";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.DOMAIN?.trim() ? `https://${process.env.DOMAIN.trim()}` : "") ||
    DEFAULT_SITE_URL;

  return raw.replace(/\/$/, "");
}
