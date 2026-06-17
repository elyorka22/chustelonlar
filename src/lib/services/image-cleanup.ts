import { getPrisma } from "@/lib/db";
import { deleteFromSpaces, extractKeyFromUrl } from "@/lib/spaces";

const PURGE_AFTER_MS = 24 * 60 * 60 * 1000;

async function deleteImageFromSpaces(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (!key) return;

  try {
    await deleteFromSpaces(key);
  } catch (error) {
    console.error(`Failed to delete ${key} from Spaces:`, error);
  }
}

export async function purgeDeletedAdImages() {
  const cutoff = new Date(Date.now() - PURGE_AFTER_MS);

  const ads = await getPrisma().ad.findMany({
    where: {
      status: "DELETED",
      deletedAt: { lte: cutoff },
      imagesPurgedAt: null,
    },
    include: { images: true },
  });

  let purgedAds = 0;
  let purgedImages = 0;

  for (const ad of ads) {
    for (const image of ad.images) {
      await Promise.all([
        deleteImageFromSpaces(image.fullUrl),
        deleteImageFromSpaces(image.thumbUrl),
      ]);
      purgedImages += 1;
    }

    await getPrisma().$transaction([
      getPrisma().adImage.deleteMany({ where: { adId: ad.id } }),
      getPrisma().ad.update({
        where: { id: ad.id },
        data: { imagesPurgedAt: new Date() },
      }),
    ]);

    purgedAds += 1;
  }

  return { purgedAds, purgedImages, checked: ads.length };
}
