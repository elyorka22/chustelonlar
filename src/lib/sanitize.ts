import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 10000);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, "").trim().slice(0, 20);
}

export function sanitizeTelegram(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32);
}
