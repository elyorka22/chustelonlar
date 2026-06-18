import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: `${APP_NAME} foydalanuvchi ma'lumotlarini qanday to'plash va ishlatish haqida`,
};

const UPDATED_AT = "18 iyun 2026";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Maxfiylik siyosati" updatedAt={UPDATED_AT}>
      <LegalSection title="1. Kirish">
        <p>
          Ushbu Maxfiylik siyosati {APP_NAME} platformasi («biz», «platforma»)
          foydalanuvchilarning shaxsiy ma&apos;lumotlarini qanday to&apos;plash,
          ishlatish va himoya qilishini tushuntiradi.
        </p>
        <p>
          Platformadan foydalanish ushbu siyosatga rozilik bildirganingizni anglatadi.
        </p>
      </LegalSection>

      <LegalSection title="2. Qanday ma'lumotlar to'planadi">
        <p><strong>Hisob ma'lumotlari:</strong> ism, email, parol (xeshlangan holda), profil rasmi (ixtiyoriy).</p>
        <p>
          <strong>E&apos;lon ma'lumotlari:</strong> sarlavha, tavsif, narx, telefon,
          Telegram, joylashuv (koordinatalar, tuman), rasmlar.
        </p>
        <p>
          <strong>Chegirmalar:</strong> biznes nomi, aksiya tavsifi, manzil, aloqa
          ma&apos;lumotlari va banner rasmlari.
        </p>
        <p>
          <strong>Texnik ma'lumotlar:</strong> IP-manzil, brauzer turi, qurilma
          ma&apos;lumotlari, cookie va sessiya identifikatorlari.
        </p>
        <p>
          <strong>Push-bildirishnomalar:</strong> brauzer obunasi (subscription)
          identifikatori — faqat siz ruxsat berganingizda.
        </p>
        <p>
          <strong>Monetka:</strong> balans, tranzaksiya tarixi (platforma ichidagi
          virtual hisob).
        </p>
      </LegalSection>

      <LegalSection title="3. Ma'lumotlardan foydalanish maqsadi">
        <ul className="list-disc space-y-1 pl-5">
          <li>hisob yaratish va autentifikatsiya;</li>
          <li>e&apos;lonlar va aksiyalarni ko&apos;rsatish, moderatsiya qilish;</li>
          <li>xarita va qidiruv funksiyalarini ta&apos;minlash;</li>
          <li>monetka balansi va pullik xizmatlarni boshqarish;</li>
          <li>bildirishnomalar yuborish (push, moderatsiya natijalari);</li>
          <li>platforma xavfsizligi, firibgarlikning oldini olish;</li>
          <li>qonuniy talablarga javob berish.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Uchinchi tomonlar">
        <p>Ma'lumotlar quyidagi xizmatlar bilan cheklangan hajmda bo&apos;lishishi mumkin:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Google OAuth</strong> — Google orqali kirish tanlasangiz;</li>
          <li><strong>DigitalOcean Spaces</strong> — yuklangan rasmlarni saqlash;</li>
          <li><strong>Hosting provayderi</strong> — server va ma&apos;lumotlar bazasi;</li>
          <li><strong>Redis</strong> — kesh va tezlik optimizatsiyasi (mavjud bo&apos;lsa).</li>
        </ul>
        <p>
          Uchinchi tomonlar o&apos;z maxfiylik siyosatiga ega. Biz ma&apos;lumotlarni
          reklama maqsadida sotmaymiz.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookie va mahalliy saqlash">
        <p>
          Platforma sessiya cookie-laridan foydalanadi (kirish holatini saqlash).
          Brauzer localStorage/sessionStorage PWA va interfeys sozlamalari uchun
          ishlatilishi mumkin.
        </p>
        <p>
          Cookie-larni brauzer sozlamalarida o&apos;chirishingiz mumkin, biroq bu
          ba&apos;zi funksiyalar ishlamasligiga olib keladi.
        </p>
      </LegalSection>

      <LegalSection title="6. Ma'lumotlarni saqlash muddati">
        <p>
          Hisob faol bo&apos;lguncha ma&apos;lumotlar saqlanadi. E&apos;lon o&apos;chirilganda
          tegishli ma&apos;lumotlar va rasmlar o&apos;chiriladi yoki anonimlashtiriladi
          (qonuniy talablar bundan mustasno).
        </p>
        <p>
          Moderatsiya va xavfsizlik jurnallari cheklangan muddat saqlanishi mumkin.
        </p>
      </LegalSection>

      <LegalSection title="7. Foydalanuvchi huquqlari">
        <p>Siz quyidagi huquqlarga egasiz:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>o&apos;z ma&apos;lumotlaringizni ko&apos;rish va yangilash (profil sozlamalari);</li>
          <li>hisobni o&apos;chirish (profil → hisobni o&apos;chirish);</li>
          <li>push-bildirishnomalarni o&apos;chirish (brauzer yoki profil sozlamalari);</li>
          <li>ma&apos;lumotlar bo&apos;yicha savol yoki shikoyat yuborish.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Xavfsizlik">
        <p>
          Parollar xeshlanadi, aloqa HTTPS orqali shifrlanadi (server sozlamalariga
          bog&apos;liq). Biroq internet orqali uzatishda mutlaq xavfsizlik kafolatlanmaydi.
        </p>
      </LegalSection>

      <LegalSection title="9. Voyaga yetmaganlar">
        <p>
          Platforma 18 yoshdan kichik shaxslar uchun mo&apos;ljallanmagan. Voyaga
          yetmaganlar ota-ona yoki vasiy ruxsatisiz ro&apos;yxatdan o&apos;tmasligi kerak.
        </p>
      </LegalSection>

      <LegalSection title="10. Siyosat o'zgarishlari">
        <p>
          Maxfiylik siyosati yangilanishi mumkin. Yangi versiya saytda e&apos;lon
          qilinadi. Muhim o&apos;zgarishlardan keyin xizmatdan foydalanish yangi
          siyosatga rozilik hisoblanadi.
        </p>
      </LegalSection>

      <LegalSection title="11. Bog'lanish">
        <p>
          Maxfiylik bo&apos;yicha savollar uchun platforma administratori bilan
          bog&apos;laning (admin panelda ko&apos;rsatilgan aloqa kanallari orqali).
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
