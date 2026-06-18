import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Foydalanish shartlari",
  description: `${APP_NAME} platformasidan foydalanish qoidalari va shartlari`,
};

const UPDATED_AT = "18 iyun 2026";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Foydalanish shartlari" updatedAt={UPDATED_AT}>
      <LegalSection title="1. Umumiy qoidalar">
        <p>
          Ushbu Foydalanish shartlari («Shartlar») {APP_NAME} onlayn platformasidan
          («Platforma») foydalanish tartibini belgilaydi. Platforma Chust shahri va
          atrofidagi foydalanuvchilarga e&apos;lonlar joylashtirish, qidirish va
          aloqa qilish imkonini beradi.
        </p>
        <p>
          Saytga kirish, ro&apos;yxatdan o&apos;tish yoki xizmatlardan foydalanish
          ushbu Shartlarga to&apos;liq rozilik bildirganingizni anglatadi. Agar
          shartlar bilan rozi bo&apos;lmasangiz, platformadan foydalanmang.
        </p>
      </LegalSection>

      <LegalSection title="2. Platformaning roli">
        <p>
          {APP_NAME} faqat e&apos;lonlar joylashtirish va ko&apos;rsatish vositasi
          hisoblanadi. Platforma sotuvchi va xaridor o&apos;rtasidagi shartnoma
          tomoni emas.
        </p>
        <p>
          Foydalanuvchilar o&apos;rtasidagi kelishuvlar, to&apos;lovlar, yetkazib
          berish va nizolar uchun javobgarlik tomonlarning o&apos;z zimmasidadir.
          Oldindan pul o&apos;tkazishdan ehtiyot bo&apos;ling; mahsulotni shaxsan
          ko&apos;rib, tekshirib oling.
        </p>
      </LegalSection>

      <LegalSection title="3. Hisob va ro&apos;yxatdan o&apos;tish">
        <p>
          Ba&apos;zi xizmatlar (e&apos;lon joylash, profil, monetka balansi) uchun
          hisob yaratish talab qilinishi mumkin. Siz to&apos;g&apos;ri va dolzarb
          ma&apos;lumot taqdim etishingiz, parolingizni maxfiy saqlashingiz shart.
        </p>
        <p>
          Hisobingizdagi harakatlar uchun javobgarsiz. Ruxsatsiz kirish aniqlansa,
          darhol biz bilan bog&apos;laning.
        </p>
      </LegalSection>

      <LegalSection title="4. E&apos;lonlar qoidalari">
        <p>Foydalanuvchi quyidagilarga rozilik bildiradi:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>faqat qonuniy mahsulot va xizmatlar haqida e&apos;lon joylashtirish;</li>
          <li>to&apos;g&apos;ri narx, tavsif, rasm va aloqa ma&apos;lumotlarini ko&apos;rsatish;</li>
          <li>boshqa shaxslarning huquq va manfaatlarini buzmaslik;</li>
          <li>soxta, chalg&apos;ituvchi yoki zararli kontent joylashtirmaslik;</li>
          <li>qonun bilan taqiqlangan tovarlar (qurol, giyohvand moddalar va hokazo) taklif qilmaslik.</li>
        </ul>
        <p>
          E&apos;lonlar moderatsiyadan o&apos;tishi mumkin. Qoidalarni buzgan
          e&apos;lonlar rad etilishi, o&apos;chirilishi yoki hisob bloklanishi
          mumkin.
        </p>
      </LegalSection>

      <LegalSection title="5. Chegirmalar va biznes e&apos;lonlari">
        <p>
          «Chegirmalar» bo&apos;limida joylashtirilgan aksiyalar tegishli biznes
          subyekti tomonidan taqdim etiladi. Platforma aksiya shartlarining
          bajarilishini kafolatlamaydi. Muddati tugagan aksiyalar avtomatik
          yashirilishi mumkin.
        </p>
      </LegalSection>

      <LegalSection title="6. Monetka va pullik xizmatlar">
        <p>
          Ba&apos;zi e&apos;lonlar yoki reklama xizmatlari platforma ichidagi
          «monetka» balansi orqali to&apos;lanishi mumkin. Monetka qiymati va
          tariflar admin panel orqali belgilanadi.
        </p>
        <p>
          Monetka sotib olish va qaytarish tartibi alohida kelishuv yoki
          platforma administratori bilan bog&apos;lanish orqali amalga oshiriladi,
          agar onlayn to&apos;lov tizimi ulangan bo&apos;lsa — tegishli qoidalarga
          muvofiq.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellektual mulk">
        <p>
          Platforma dizayni, logotipi va dasturiy ta&apos;minoti {APP_NAME}ga
          tegishli. Foydalanuvchi joylashtirgan kontent (matn, rasm) huquqi
          foydalanuvchida qoladi, biroq foydalanuvchi platformaga ushbu kontentni
          ko&apos;rsatish va targ&apos;q qilish uchun nisbatan litsenziya beradi.
        </p>
      </LegalSection>

      <LegalSection title="8. Taqiqlangan harakatlar">
        <ul className="list-disc space-y-1 pl-5">
          <li>platformaga zarar yetkazish yoki xavfsizlikni buzish;</li>
          <li>avtomatlashtirilgan yig&apos;ish (scraping) va ruxsatsiz API foydalanish;</li>
          <li>soxta hisoblar va spam;</li>
          <li>boshqa foydalanuvchilarni firibgarlikka undash;</li>
          <li>qonun va odob-axloq qoidalariga zid harakatlar.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Javobgarlik cheklovi">
        <p>
          Platforma «boricha» («as is») taqdim etiladi. Xizmat uzilishlari, ma&apos;lumot
          yo&apos;qotishlari yoki uchinchi tomon harakatlari uchun maksimal darajada
          qonun ruxsat bergan chegarada javobgarlik cheklanadi.
        </p>
        <p>
          Foydalanuvchilar o&apos;zaro bitimlar va aloqa xavfsizligi uchun shaxsan
          ehtiyot choralarini ko&apos;rishlari shart.
        </p>
      </LegalSection>

      <LegalSection title="10. Shartlarni o&apos;zgartirish">
        <p>
          Platforma ushbu Shartlarni yangilashi mumkin. Muhim o&apos;zgarishlar
          saytda e&apos;lon qilinadi. Yangilanishdan keyin xizmatdan foydalanish
          yangi shartlarga rozilik hisoblanadi.
        </p>
      </LegalSection>

      <LegalSection title="11. Bog&apos;lanish">
        <p>
          Savollar va shikoyatlar uchun platforma administratori bilan bog&apos;laning
          (admin panelda ko&apos;rsatilgan Telegram, telefon yoki email orqali).
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
