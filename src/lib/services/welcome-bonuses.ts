import { getPrisma } from "@/lib/db";
import { getMonetizationSettings } from "@/lib/services/monetization";

const USER_BONUS_DESCRIPTION = "Yangi foydalanuvchi bonusi";
const BUSINESS_BONUS_DESCRIPTION = "Yangi biznes akkaunt bonusi";

export async function tryGrantUserWelcomeBonus(
  userId: string
): Promise<{ granted: boolean; amount: number }> {
  const settings = await getMonetizationSettings();
  const amount = settings.newUserWelcomeBonus;
  if (amount <= 0) {
    return { granted: false, amount: 0 };
  }

  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { userWelcomeBonusGranted: true, role: true },
    });

    if (!user || user.userWelcomeBonusGranted || user.role === "BANNED") {
      return { granted: false, amount: 0 };
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        userWelcomeBonusGranted: true,
        coinBalance: { increment: amount },
      },
    });

    await tx.coinTransaction.create({
      data: {
        userId,
        type: "BONUS",
        amount,
        description: USER_BONUS_DESCRIPTION,
      },
    });

    return { granted: true, amount };
  });
}

export async function tryGrantBusinessWelcomeBonus(
  userId: string
): Promise<{ granted: boolean; amount: number }> {
  const settings = await getMonetizationSettings();
  const amount = settings.newBusinessWelcomeBonus;
  if (amount <= 0) {
    return { granted: false, amount: 0 };
  }

  return getPrisma().$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { businessWelcomeBonusGranted: true, role: true },
    });

    if (
      !user ||
      user.businessWelcomeBonusGranted ||
      user.role === "BANNED" ||
      (user.role !== "BUSINESS" && user.role !== "ADMIN")
    ) {
      return { granted: false, amount: 0 };
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        businessWelcomeBonusGranted: true,
        coinBalance: { increment: amount },
      },
    });

    await tx.coinTransaction.create({
      data: {
        userId,
        type: "BONUS",
        amount,
        description: BUSINESS_BONUS_DESCRIPTION,
      },
    });

    return { granted: true, amount };
  });
}

export async function distributePendingUserWelcomeBonuses(): Promise<number> {
  const settings = await getMonetizationSettings();
  if (settings.newUserWelcomeBonus <= 0) {
    return 0;
  }

  const users = await getPrisma().user.findMany({
    where: {
      userWelcomeBonusGranted: false,
      role: { not: "BANNED" },
    },
    select: { id: true },
  });

  let count = 0;
  for (const user of users) {
    const result = await tryGrantUserWelcomeBonus(user.id);
    if (result.granted) count++;
  }

  return count;
}

export async function distributePendingBusinessWelcomeBonuses(): Promise<number> {
  const settings = await getMonetizationSettings();
  if (settings.newBusinessWelcomeBonus <= 0) {
    return 0;
  }

  const users = await getPrisma().user.findMany({
    where: {
      businessWelcomeBonusGranted: false,
      role: { in: ["BUSINESS", "ADMIN"] },
    },
    select: { id: true },
  });

  let count = 0;
  for (const user of users) {
    const result = await tryGrantBusinessWelcomeBonus(user.id);
    if (result.granted) count++;
  }

  return count;
}

export async function getPendingWelcomeCelebration(
  userId: string
): Promise<{ type: "user" | "business"; amount: number } | null> {
  const settings = await getMonetizationSettings();

  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: {
      userWelcomeBonusGranted: true,
      businessWelcomeBonusGranted: true,
      userWelcomeCelebrationShown: true,
      businessWelcomeCelebrationShown: true,
    },
  });

  if (!user) return null;

  if (
    user.userWelcomeBonusGranted &&
    !user.userWelcomeCelebrationShown &&
    settings.newUserWelcomeBonus > 0
  ) {
    await getPrisma().user.update({
      where: { id: userId },
      data: { userWelcomeCelebrationShown: true },
    });
    return { type: "user", amount: settings.newUserWelcomeBonus };
  }

  if (
    user.businessWelcomeBonusGranted &&
    !user.businessWelcomeCelebrationShown &&
    settings.newBusinessWelcomeBonus > 0
  ) {
    await getPrisma().user.update({
      where: { id: userId },
      data: { businessWelcomeCelebrationShown: true },
    });
    return { type: "business", amount: settings.newBusinessWelcomeBonus };
  }

  return null;
}
