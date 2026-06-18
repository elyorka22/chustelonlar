export type WelcomeBonusCelebrationType = "user" | "business";

export type WelcomeBonusCelebration = {
  type: WelcomeBonusCelebrationType;
  amount: number;
};

export const WELCOME_BONUS_CHECK_EVENT = "welcome-bonus-check";

export function dispatchWelcomeBonusCheck() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WELCOME_BONUS_CHECK_EVENT));
}

export function getWelcomeBonusCopy(type: WelcomeBonusCelebrationType, amount: number) {
  if (type === "business") {
    return {
      title: "Biznes akkaunt faollashtirildi!",
      subtitle: `Tabriklaymiz! Sizga ${amount} ta Monetka sovg'a qilindi`,
      hint: "Aksiyalar yaratish va e'lonlarni targ'ib qilish uchun foydalaning",
      cta: "Aksiyalar yaratish",
      ctaHref: "/chegirmalar/create",
    };
  }

  return {
    title: "Xush kelibsiz!",
    subtitle: `Tabriklaymiz! Sizga ${amount} ta Monetka sovg'a qilindi`,
    hint: "E'lon joylash, TOP va VIP reklama uchun sayt bo'ylab foydalaning",
    cta: "E'lon joylash",
    ctaHref: "/create",
  };
}
