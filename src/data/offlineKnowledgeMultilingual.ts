/**
 * Multilingual Offline Knowledge Base
 * Translations for 9 Indian languages + English
 */

export type SupportedLanguage = 'en' | 'hi' | 'ur' | 'ta' | 'te' | 'bn' | 'kn' | 'ml' | 'ks';

export const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ur: 'اردو',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  ks: 'کٲشُر',
};

export interface MultilingualEntry {
  id: string;
  category: string;
  translations: Partial<Record<SupportedLanguage, { question: string; answer: string; keywords: string[] }>>;
}

export const multilingualKnowledge: MultilingualEntry[] = [
  {
    id: 'bis-overview',
    category: 'overview',
    translations: {
      en: {
        question: 'What is BIS?',
        keywords: ['bis', 'bureau', 'indian standards', 'what is bis'],
        answer: `**Bureau of Indian Standards (BIS)** is the national standards body of India, established under the BIS Act, 2016.\n\n**Key Functions:**\n- Formulation of Indian Standards\n- Product certification through ISI Mark\n- Hallmarking of gold/silver jewellery\n- Laboratory testing and calibration\n\n**Helpline:** 14100 (toll-free)`,
      },
      hi: {
        question: 'BIS क्या है?',
        keywords: ['bis', 'भारतीय मानक ब्यूरो', 'बीआईएस', 'bis kya hai'],
        answer: `**भारतीय मानक ब्यूरो (BIS)** भारत का राष्ट्रीय मानक निकाय है, जो BIS अधिनियम, 2016 के तहत स्थापित है।\n\n**मुख्य कार्य:**\n- भारतीय मानकों का निर्माण\n- ISI मार्क द्वारा उत्पाद प्रमाणन\n- सोने/चांदी की हॉलमार्किंग\n- प्रयोगशाला परीक्षण\n\n**हेल्पलाइन:** 14100 (टोल-फ्री)`,
      },
      ur: {
        question: 'BIS کیا ہے؟',
        keywords: ['bis', 'بیورو آف انڈین اسٹینڈرڈز'],
        answer: `**بیورو آف انڈین اسٹینڈرڈز (BIS)** ہندوستان کا قومی معیارات ادارہ ہے۔\n\n**اہم کام:**\n- ہندوستانی معیارات کی تشکیل\n- ISI مارک سے مصنوعات کی تصدیق\n- سونے/چاندی کی ہال مارکنگ\n\n**ہیلپ لائن:** 14100`,
      },
      ta: {
        question: 'BIS என்றால் என்ன?',
        keywords: ['bis', 'இந்திய தரநிலை அமைப்பு'],
        answer: `**இந்திய தரநிலை அமைப்பு (BIS)** என்பது இந்தியாவின் தேசிய தரநிலை அமைப்பாகும்.\n\n**முக்கிய செயல்பாடுகள்:**\n- இந்திய தரநிலைகளை உருவாக்குதல்\n- ISI முத்திரை மூலம் தயாரிப்பு சான்றிதழ்\n- தங்கம்/வெள்ளி ஹால்மார்க்கிங்\n\n**உதவி எண்:** 14100`,
      },
      te: {
        question: 'BIS అంటే ఏమిటి?',
        keywords: ['bis', 'భారతీయ ప్రమాణాల సంస్థ'],
        answer: `**భారతీయ ప్రమాణాల సంస్థ (BIS)** భారతదేశ జాతీయ ప్రమాణాల సంస్థ.\n\n**ముఖ్య విధులు:**\n- భారతీయ ప్రమాణాల రూపకల్పన\n- ISI గుర్తు ద్వారా ఉత్పత్తి ధృవీకరణ\n- బంగారం/వెండి హాల్‌మార్కింగ్\n\n**హెల్ప్‌లైన్:** 14100`,
      },
      bn: {
        question: 'BIS কী?',
        keywords: ['bis', 'ভারতীয় মানক ব্যুরো'],
        answer: `**ভারতীয় মানক ব্যুরো (BIS)** ভারতের জাতীয় মানক সংস্থা।\n\n**প্রধান কাজ:**\n- ভারতীয় মানক তৈরি\n- ISI মার্ক দ্বারা পণ্য প্রত্যয়ন\n- সোনা/রুপার হলমার্কিং\n\n**হেল্পলাইন:** 14100`,
      },
      kn: {
        question: 'BIS ಎಂದರೇನು?',
        keywords: ['bis', 'ಭಾರತೀಯ ಮಾನಕ ಸಂಸ್ಥೆ'],
        answer: `**ಭಾರತೀಯ ಮಾನಕ ಸಂಸ್ಥೆ (BIS)** ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ಮಾನಕ ಸಂಸ್ಥೆ.\n\n**ಪ್ರಮುಖ ಕಾರ್ಯಗಳು:**\n- ಭಾರತೀಯ ಮಾನಕಗಳ ರಚನೆ\n- ISI ಗುರುತು ಮೂಲಕ ಉತ್ಪನ್ನ ಪ್ರಮಾಣೀಕರಣ\n\n**ಸಹಾಯವಾಣಿ:** 14100`,
      },
      ml: {
        question: 'BIS എന്താണ്?',
        keywords: ['bis', 'ഇന്ത്യൻ സ്റ്റാൻഡേർഡ്സ് ബ്യൂറോ'],
        answer: `**ബ്യൂറോ ഓഫ് ഇന്ത്യൻ സ്റ്റാൻഡേർഡ്സ് (BIS)** ഇന്ത്യയുടെ ദേശീയ നിലവാര സ്ഥാപനമാണ്.\n\n**പ്രധാന പ്രവർത്തനങ്ങൾ:**\n- ഇന്ത്യൻ നിലവാരങ്ങളുടെ രൂപീകരണം\n- ISI മാർക്ക് വഴി ഉൽപ്പന്ന സർട്ടിഫിക്കേഷൻ\n\n**ഹെൽപ്‌ലൈൻ:** 14100`,
      },
      ks: {
        question: 'BIS کیٛا چھُ?',
        keywords: ['bis'],
        answer: `**بیٛورو آف اِنڈِین اسٹینڈرڈز (BIS)** ہِندوستانُک قومی معیار ادارٕ چھُ۔\n\n**ہیلپ لائن:** 14100`,
      },
    },
  },
  {
    id: 'isi-mark',
    category: 'overview',
    translations: {
      en: {
        question: 'What is the ISI Mark?',
        keywords: ['isi', 'isi mark', 'isi logo', 'isi certification'],
        answer: `**ISI Mark** is a certification mark issued by BIS for industrial products.\n\n**How to identify:**\n- Look for the ISI logo (triangle with ISI)\n- Check licence number below the mark\n- Verify at bis.gov.in\n\n**Mandatory for:** Cement, LPG cylinders, electrical goods, packaged water, helmets.`,
      },
      hi: {
        question: 'ISI मार्क क्या है?',
        keywords: ['isi', 'आईएसआई', 'isi mark', 'isi kya hai'],
        answer: `**ISI मार्क** BIS द्वारा औद्योगिक उत्पादों के लिए दिया जाने वाला प्रमाणन चिह्न है।\n\n**कैसे पहचानें:**\n- ISI लोगो देखें (त्रिकोण में ISI)\n- लाइसेंस नंबर जांचें\n- bis.gov.in पर सत्यापित करें\n\n**अनिवार्य:** सीमेंट, LPG सिलेंडर, बिजली के सामान, पैकेज्ड पानी, हेलमेट`,
      },
      ta: {
        question: 'ISI முத்திரை என்றால் என்ன?',
        keywords: ['isi', 'isi mark'],
        answer: `**ISI முத்திரை** என்பது BIS வழங்கும் சான்றிதழ் முத்திரை.\n\n**அடையாளம் காண:**\n- ISI லோகோவைப் பாருங்கள்\n- உரிம எண்ணை சரிபாருங்கள்\n- bis.gov.in இல் சரிபார்க்கவும்`,
      },
      bn: {
        question: 'ISI মার্ক কী?',
        keywords: ['isi', 'আইএসআই'],
        answer: `**ISI মার্ক** হল BIS কর্তৃক শিল্প পণ্যের জন্য প্রদত্ত সার্টিফিকেশন মার্ক।\n\n**কীভাবে চিনবেন:**\n- ISI লোগো দেখুন\n- লাইসেন্স নম্বর যাচাই করুন\n- bis.gov.in-এ যাচাই করুন`,
      },
      te: {
        question: 'ISI గుర్తు అంటే ఏమిటి?',
        keywords: ['isi', 'isi mark'],
        answer: `**ISI గుర్తు** BIS జారీ చేసే ధృవీకరణ గుర్తు.\n\n**గుర్తించడం:**\n- ISI లోగో చూడండి\n- లైసెన్స్ నంబర్ తనిఖీ చేయండి\n- bis.gov.in లో ధృవీకరించండి`,
      },
      ur: {
        question: 'ISI مارک کیا ہے؟',
        keywords: ['isi', 'آئی ایس آئی'],
        answer: `**ISI مارک** BIS کی طرف سے صنعتی مصنوعات کے لیے جاری کیا جانے والا تصدیقی نشان ہے۔\n\n**پہچان کیسے کریں:**\n- ISI لوگو دیکھیں\n- لائسنس نمبر چیک کریں`,
      },
      kn: {
        question: 'ISI ಗುರುತು ಎಂದರೇನು?',
        keywords: ['isi'],
        answer: `**ISI ಗುರುತು** BIS ನೀಡುವ ಪ್ರಮಾಣೀಕರಣ ಗುರುತು.\n\n- ISI ಲೋಗೊ ನೋಡಿ\n- ಪರವಾನಗಿ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ`,
      },
      ml: {
        question: 'ISI മാർക്ക് എന്താണ്?',
        keywords: ['isi'],
        answer: `**ISI മാർക്ക്** BIS നൽകുന്ന സർട്ടിഫിക്കേഷൻ മാർക്കാണ്.\n\n- ISI ലോഗോ നോക്കുക\n- ലൈസൻസ് നമ്പർ പരിശോധിക്കുക`,
      },
    },
  },
  {
    id: 'helmet-standard',
    category: 'standards',
    translations: {
      en: {
        question: 'What is the BIS standard for helmets?',
        keywords: ['helmet', 'bike helmet', 'is 4151'],
        answer: `**Helmets must follow IS 4151:2015**\n\n**Safety Checks:**\n- ✅ ISI mark on the helmet\n- ✅ Check IS 4151 standard number\n- ✅ Verify licence number\n- ✅ Check manufacturing date (replace after 3-5 years)\n- ✅ Ensure chin strap strength\n\n**Red Flags:**\n- ❌ No ISI mark\n- ❌ Extremely lightweight\n- ❌ Loose chin strap`,
      },
      hi: {
        question: 'हेलमेट के लिए BIS मानक क्या है?',
        keywords: ['हेलमेट', 'helmet', 'is 4151'],
        answer: `**हेलमेट के लिए IS 4151:2015 मानक**\n\n**सुरक्षा जांच:**\n- ✅ हेलमेट पर ISI मार्क देखें\n- ✅ IS 4151 नंबर जांचें\n- ✅ लाइसेंस नंबर सत्यापित करें\n- ✅ निर्माण तिथि जांचें (3-5 साल बाद बदलें)\n\n**खतरे के संकेत:**\n- ❌ ISI मार्क नहीं\n- ❌ बहुत हल्का\n- ❌ ढीला चिन स्ट्रैप`,
      },
      ta: {
        question: 'ஹெல்மெட்டுக்கான BIS தரநிலை என்ன?',
        keywords: ['ஹெல்மெட்', 'helmet', 'is 4151'],
        answer: `**ஹெல்மெட்டுகள் IS 4151:2015 தரநிலையைப் பின்பற்ற வேண்டும்**\n\n- ✅ ISI முத்திரை பாருங்கள்\n- ✅ IS 4151 எண் சரிபாருங்கள்\n- ✅ உரிம எண் சரிபார்க்கவும்`,
      },
      bn: {
        question: 'হেলমেটের জন্য BIS স্ট্যান্ডার্ড কী?',
        keywords: ['হেলমেট', 'helmet'],
        answer: `**হেলমেটের জন্য IS 4151:2015**\n\n- ✅ ISI মার্ক আছে কিনা দেখুন\n- ✅ IS 4151 নম্বর যাচাই করুন\n- ✅ ৩-৫ বছর পর বদলান`,
      },
      te: {
        question: 'హెల్మెట్ కోసం BIS ప్రమాణం ఏమిటి?',
        keywords: ['హెల్మెట్', 'helmet'],
        answer: `**హెల్మెట్‌ల కోసం IS 4151:2015**\n\n- ✅ ISI గుర్తు చూడండి\n- ✅ IS 4151 నంబర్ తనిఖీ చేయండి`,
      },
      ur: {
        question: 'ہیلمٹ کے لیے BIS معیار کیا ہے؟',
        keywords: ['ہیلمٹ', 'helmet'],
        answer: `**ہیلمٹ کے لیے IS 4151:2015**\n\n- ✅ ISI مارک دیکھیں\n- ✅ IS 4151 نمبر چیک کریں`,
      },
    },
  },
  {
    id: 'certification-process',
    category: 'certification',
    translations: {
      en: {
        question: 'How to get BIS Certification?',
        keywords: ['certification', 'apply', 'how to get', 'bis certificate', 'license'],
        answer: `**Steps to get BIS Certification:**\n\n1. **Apply Online** — Visit manakonline.bis.gov.in\n2. **Submit Documents** — Factory details, test reports\n3. **Factory Inspection** — BIS officer visits\n4. **Sample Testing** — Products tested in BIS labs\n5. **Grant of Licence** — If compliant\n6. **Surveillance** — Periodic checks\n\n**Fees:** ₹1,000 application fee\n**Timeline:** 60-90 days`,
      },
      hi: {
        question: 'BIS प्रमाणन कैसे प्राप्त करें?',
        keywords: ['प्रमाणन', 'certification', 'आवेदन'],
        answer: `**BIS प्रमाणन प्राप्त करने के चरण:**\n\n1. **ऑनलाइन आवेदन** — manakonline.bis.gov.in पर जाएं\n2. **दस्तावेज जमा करें** — फैक्ट्री विवरण, परीक्षण रिपोर्ट\n3. **फैक्ट्री निरीक्षण** — BIS अधिकारी का दौरा\n4. **नमूना परीक्षण** — BIS लैब में\n5. **लाइसेंस मंजूरी**\n\n**शुल्क:** ₹1,000 आवेदन शुल्क\n**समय:** 60-90 दिन`,
      },
      ta: {
        question: 'BIS சான்றிதழ் எப்படி பெறுவது?',
        keywords: ['சான்றிதழ்', 'certification'],
        answer: `**BIS சான்றிதழ் பெறும் படிகள்:**\n\n1. ஆன்லைனில் விண்ணப்பிக்கவும்\n2. ஆவணங்களை சமர்ப்பிக்கவும்\n3. தொழிற்சாலை ஆய்வு\n4. மாதிரி சோதனை\n5. உரிமம் வழங்கல்\n\n**கட்டணம்:** ₹1,000`,
      },
      bn: {
        question: 'BIS সার্টিফিকেশন কীভাবে পাবেন?',
        keywords: ['সার্টিফিকেশন', 'certification'],
        answer: `**BIS সার্টিফিকেশন পাওয়ার ধাপ:**\n\n1. অনলাইনে আবেদন করুন\n2. নথি জমা দিন\n3. কারখানা পরিদর্শন\n4. নমুনা পরীক্ষা\n5. লাইসেন্স মঞ্জুরি\n\n**ফি:** ₹1,000`,
      },
    },
  },
  {
    id: 'complaint-process',
    category: 'complaints',
    translations: {
      en: {
        question: 'How to file a complaint about a fake product?',
        keywords: ['complaint', 'report', 'fake', 'counterfeit', 'shikayat'],
        answer: `**How to Report Fake Products:**\n\n**Online:** bis.gov.in → Public Grievances\n**Helpline:** 14100 (toll-free)\n**Email:** cmd@bis.gov.in\n**BIS CARE App:** Download from Play Store\n\n**Information needed:**\n- Product name and brand\n- ISI mark / licence number\n- Where purchased\n- Photos of the product`,
      },
      hi: {
        question: 'नकली उत्पाद की शिकायत कैसे करें?',
        keywords: ['शिकायत', 'complaint', 'नकली', 'रिपोर्ट'],
        answer: `**नकली उत्पाद की रिपोर्ट कैसे करें:**\n\n**ऑनलाइन:** bis.gov.in → सार्वजनिक शिकायत\n**हेल्पलाइन:** 14100 (टोल-फ्री)\n**ईमेल:** cmd@bis.gov.in\n**BIS CARE ऐप:** प्ले स्टोर से डाउनलोड करें\n\n**आवश्यक जानकारी:**\n- उत्पाद का नाम और ब्रांड\n- ISI मार्क / लाइसेंस नंबर\n- कहां से खरीदा\n- उत्पाद की फोटो`,
      },
      ta: {
        question: 'போலி பொருளைப் பற்றி புகார் எப்படி செய்வது?',
        keywords: ['புகார்', 'complaint', 'போலி'],
        answer: `**போலி பொருட்களை புகார் செய்வது:**\n\n**ஆன்லைன்:** bis.gov.in\n**உதவி எண்:** 14100\n**மின்னஞ்சல்:** cmd@bis.gov.in\n**BIS CARE செயலி:** Play Store-ல் பதிவிறக்கம்`,
      },
      bn: {
        question: 'ভুয়া পণ্যের বিরুদ্ধে অভিযোগ কীভাবে করবেন?',
        keywords: ['অভিযোগ', 'complaint', 'ভুয়া'],
        answer: `**ভুয়া পণ্যের রিপোর্ট করুন:**\n\n**অনলাইন:** bis.gov.in\n**হেল্পলাইন:** 14100\n**ইমেইল:** cmd@bis.gov.in\n**BIS CARE অ্যাপ:** Play Store থেকে ডাউনলোড করুন`,
      },
    },
  },
  {
    id: 'consumer-rights',
    category: 'safety',
    translations: {
      en: {
        question: 'What are consumer rights related to product safety?',
        keywords: ['consumer', 'rights', 'consumer rights', 'consumer protection'],
        answer: `**Consumer Rights under Consumer Protection Act, 2019:**\n\n1. **Right to Safety** — Protection from hazardous products\n2. **Right to Information** — Full product details\n3. **Right to Choose** — Access to variety\n4. **Right to be Heard** — File complaints\n5. **Right to Redressal** — Compensation for defective products\n\n**Helpline:** 1800-11-4000\n**BIS Helpline:** 14100`,
      },
      hi: {
        question: 'उत्पाद सुरक्षा से संबंधित उपभोक्ता अधिकार क्या हैं?',
        keywords: ['उपभोक्ता', 'अधिकार', 'consumer rights'],
        answer: `**उपभोक्ता संरक्षण अधिनियम, 2019 के तहत अधिकार:**\n\n1. **सुरक्षा का अधिकार**\n2. **सूचना का अधिकार**\n3. **चुनने का अधिकार**\n4. **सुने जाने का अधिकार**\n5. **निवारण का अधिकार**\n\n**हेल्पलाइन:** 1800-11-4000\n**BIS हेल्पलाइन:** 14100`,
      },
    },
  },
  {
    id: 'electrical-safety',
    category: 'safety',
    translations: {
      en: {
        question: 'Electrical safety tips at home?',
        keywords: ['electrical safety', 'electric shock', 'fire safety', 'wiring safety'],
        answer: `**Electrical Safety Tips:**\n\n1. ✅ Use only ISI-marked electrical products\n2. ✅ Check wiring insulation regularly\n3. ✅ Use MCB/RCCB circuit breakers\n4. ✅ Don't overload sockets\n5. ✅ Keep electrical items away from water\n6. ✅ Use proper earthing\n\n**Emergency:** Fire service — **101**`,
      },
      hi: {
        question: 'घर में बिजली सुरक्षा के उपाय?',
        keywords: ['बिजली सुरक्षा', 'electrical safety'],
        answer: `**बिजली सुरक्षा सुझाव:**\n\n1. ✅ केवल ISI मार्क वाले बिजली उत्पाद उपयोग करें\n2. ✅ वायरिंग की नियमित जांच करें\n3. ✅ MCB/RCCB सर्किट ब्रेकर लगाएं\n4. ✅ सॉकेट ओवरलोड न करें\n5. ✅ बिजली के सामान को पानी से दूर रखें\n\n**आपातकाल:** अग्निशमन सेवा — **101**`,
      },
    },
  },
  {
    id: 'pressure-cooker',
    category: 'standards',
    translations: {
      en: {
        question: 'What is the BIS standard for pressure cookers?',
        keywords: ['pressure cooker', 'cooker', 'is 2347'],
        answer: `**Pressure Cookers follow IS 2347:2017**\n\n**Safety Checks:**\n- ✅ ISI mark with licence number\n- ✅ Safety valve and fusible plug\n- ✅ Gasket in good condition\n- ✅ Handle firmly attached\n\n**Red Flags:**\n- ❌ No ISI mark\n- ❌ Missing safety valve\n- ❌ Wobbly handles`,
      },
      hi: {
        question: 'प्रेशर कुकर के लिए BIS मानक क्या है?',
        keywords: ['प्रेशर कुकर', 'कुकर', 'pressure cooker'],
        answer: `**प्रेशर कुकर IS 2347:2017 मानक**\n\n**सुरक्षा जांच:**\n- ✅ ISI मार्क और लाइसेंस नंबर\n- ✅ सेफ्टी वॉल्व और फ्यूजिबल प्लग\n- ✅ गैस्केट अच्छी स्थिति में\n\n**खतरे के संकेत:**\n- ❌ ISI मार्क नहीं\n- ❌ सेफ्टी वॉल्व गायब`,
      },
    },
  },
];

/**
 * Search multilingual offline knowledge
 */
export function searchMultilingualKnowledge(
  query: string,
  lang: SupportedLanguage = 'en'
): { question: string; answer: string; category: string }[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  const scored = multilingualKnowledge
    .map((entry) => {
      // Try requested language first, fall back to English
      const t = entry.translations[lang] || entry.translations.en;
      if (!t) return null;

      let score = 0;

      if (t.question.toLowerCase().includes(normalizedQuery)) score += 10;

      for (const keyword of t.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) score += 5;
        for (const word of queryWords) {
          if (word.length > 2 && keyword.toLowerCase().includes(word)) score += 2;
        }
      }

      // Also search English keywords as fallback
      if (lang !== 'en' && entry.translations.en) {
        for (const keyword of entry.translations.en.keywords) {
          if (normalizedQuery.includes(keyword.toLowerCase())) score += 3;
        }
      }

      for (const word of queryWords) {
        if (word.length > 2 && t.answer.toLowerCase().includes(word)) score += 1;
      }

      return { entry, translation: t, category: entry.category, score };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null && s.score > 0);

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({
      question: s.translation.question,
      answer: s.translation.answer,
      category: s.category,
    }));
}
