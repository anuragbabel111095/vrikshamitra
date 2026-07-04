"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "gu";

export interface FarmerProfile {
  district: string;
  taluka: string;
  landSize: number;
  landUnit: "acre" | "bigha" | "hectare";
  soilType: string; // loamy, black_cotton, sandy, saline, clayey
  waterSource: string; // rainfed, well, canal, drip
  currentCrops: string[];
  goals: string[];
}

export interface SavedPlan {
  speciesIds: string[];
  schemeId: string | null;
  documentsChecked: string[];
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  profile: FarmerProfile;
  updateProfile: (updates: Partial<FarmerProfile>) => void;
  savedPlan: SavedPlan;
  saveSpecies: (speciesId: string) => void;
  removeSpecies: (speciesId: string) => void;
  saveScheme: (schemeId: string | null) => void;
  toggleDocument: (docId: string) => void;
  clearPlan: () => void;
  t: (key: string) => string;
  convertLandToAcres: (size: number, unit: "acre" | "bigha" | "hectare") => number;
}

const defaultProfile: FarmerProfile = {
  district: "",
  taluka: "",
  landSize: 0,
  landUnit: "acre",
  soilType: "",
  waterSource: "",
  currentCrops: [],
  goals: [],
};

const defaultPlan: SavedPlan = {
  speciesIds: [],
  schemeId: null,
  documentsChecked: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const translations: Record<string, Record<Language, string>> = {
  // Navigation & General
  brand_name: { en: "VrikshaMitra", hi: "वृक्ष मित्र", gu: "વૃક્ષમિત્ર" },
  brand_tagline: { en: "Agroforestry Advisor for Gujarat", hi: "गुजरात के लिए कृषि वानिकी सलाहकार", gu: "ગુજરાતના ખેડૂતો માટે કૃષિ વનીકરણ માર્ગદર્શક" },
  home: { en: "Home", hi: "मुख्य पृष्ठ", gu: "હોમ" },
  chat: { en: "AI Chat Advisor", hi: "एआई चैट सलाहकार", gu: "ચેટ સલાહકાર" },
  my_plan: { en: "My Plan", hi: "मेरी योजना", gu: "મારી યોજના" },
  nurseries: { en: "Nurseries", hi: "नर्सरी खोजें", gu: "નર્સરી શોધો" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", gu: "ડેશબોર્ડ" },
  back: { en: "Back", hi: "पीछे", gu: "પાછા જાઓ" },
  next: { en: "Next", hi: "आगे", gu: "આગળ" },
  submit: { en: "Submit", hi: "जमा करें", gu: "સબમિટ" },
  save: { en: "Save", hi: "सहेजें", gu: "સાચવો" },
  saved: { en: "Saved", hi: "सहेजा गया", gu: "સાચવેલ" },
  loading: { en: "Loading...", hi: "लोड हो रहा है...", gu: "લોડ થઈ રહ્યું છે..." },

  // Landing Page
  hero_title: { en: "Grow Trees. Multiply Income. Protect Your Soil.", hi: "पेड़ उगाएं। आय बढ़ाएं। अपनी मिट्टी बचाएं।", gu: "વૃક્ષો વાવો. આવક વધારો. જમીન ફળદ્રુપ બનાવો." },
  hero_subtitle: { en: "Get personalized AI advice to plant the right trees on your farm bunds & boundaries aligned with Gujarat Government schemes.", hi: "अपने खेत की मेढ़ों पर सही पेड़ लगाने और गुजरात सरकार की योजनाओं का लाभ उठाने के लिए व्यक्तिगत एआई सलाह प्राप्त करें।", gu: "ગુજરાત સરકારની યોજનાઓ સાથે તમારા ખેતરના શેઢા-પાળ પર સુસંગત વૃક્ષો વાવવાની અને વ્યક્તિગત એઆઈ સલાહ મેળવો." },
  cta_start_chat: { en: "Talk to VrikshaMitra", hi: "वृक्ष मित्र से बात करें", gu: "વૃક્ષમિત્ર સાથે વાત કરો" },
  quick_stats: { en: "Gujarat Social Forestry Approved", hi: "गुजरात सामाजिक वानिकी द्वारा स्वीकृत", gu: "ગુજરાત સામાજિક વનીકરણ માન્ય" },
  step1_title: { en: "1. Tell Us About Your Farm", hi: "1. अपने खेत के बारे में बताएं", gu: "૧. તમારા ખેતરની વિગત આપો" },
  step1_desc: { en: "Enter soil, district, and crop details through our simple farmer-friendly chat assistant.", hi: "हमारे सरल और आसान चैट सहायक के माध्यम से अपनी मिट्टी, जिला और फसल का विवरण दर्ज करें।", gu: "અમારા સરળ અને ખેડૂતલક્ષી ચેટ આસિસ્ટન્ટ દ્વારા જમીન, જિલ્લો અને પાકની માહિતી આપો." },
  step2_title: { en: "2. Get Tree Matches", hi: "2. सर्वोत्तम पेड़ों की सूची पाएं", gu: "૨. વૃક્ષોની ભલામણ મેળવો" },
  step2_desc: { en: "Our recommendation engine finds trees that naturally coexist with your crops and boost profits.", hi: "हमारा इंजन उन पेड़ों की खोज करता है जो आपकी फसलों को नुकसान पहुंचाए बिना अतिरिक्त लाभ प्रदान करते हैं।", gu: "અમારું એન્જિન તમારા પાકને નુકસાન કર્યા વિના વધારાનો નફો આપતા વૃક્ષો શોધી આપે છે." },
  step3_title: { en: "3. Link to Govt Schemes", hi: "3. सरकारी योजनाओं से जुड़ें", gu: "૩. સરકારી યોજનાઓ જોડો" },
  step3_desc: { en: "Apply for schemes like 'Har Medh Par Ped' and discover local forestry nurseries with free saplings.", hi: "'हर मेढ़ पर पेड़' जैसी योजनाओं के लिए आवेदन करें और मुफ्त पौधे देने वाली सरकारी नर्सरी ढूंढें।", gu: "'હર મેઢ પર પેડ' જેવી યોજનાઓ માટે જરૂરી પત્રકો અને રાહત દરના સરકારી ડેપો શોધો." },

  // Chat/Guided Flow
  chat_welcome: { 
    en: "Namaste! I am VrikshaMitra, your digital tree advisor. Let's create your farm profile to find the best trees for your bunds. You can talk to me in English, Hindi, or Gujarati anytime. Press the microphone to speak!",
    hi: "नमस्ते! मैं वृक्ष मित्र हूँ, आपका डिजिटल पेड़ सलाहकार। आइए आपके खेतों के लिए सर्वोत्तम पेड़ खोजने के लिए आपका प्रोफ़ाइल बनाएं। आप मुझसे हिंदी, गुजराती या अंग्रेजी में बात कर सकते हैं। बोलने के लिए माइक दबाएं!",
    gu: "નમસ્તે! હું વૃક્ષમિત્ર છું, તમારો ડિજિટલ વૃક્ષ સલાહકાર. ચાલો તમારા ખેતર માટે શ્રેષ્ઠ વૃક્ષો શોધવા પ્રોફાઇલ બનાવીએ. તમે ગમે ત્યારે ગુજરાતી, હિન્દી કે અંગ્રેજીમાં વાત કરી શકો છો. બોલવા માટે માઇક દબાવો!"
  },
  question_district: { en: "Select your farm district in Gujarat:", hi: "गुजरात में अपने खेत का जिला चुनें:", gu: "ગુજરાતમાં તમારા ખેતરનો જિલ્લો પસંદ કરો:" },
  question_taluka: { en: "Select your Taluka (Sub-district):", hi: "अपना तालुका (उप-जिला) चुनें:", gu: "તમારો તાલુકો પસંદ કરો:" },
  question_land: { en: "How much land do you have?", hi: "आपके पास कितनी जमीन है?", gu: "તમારી પાસે કેટલી જમીન છે?" },
  question_soil: { en: "What type of soil does your farm have?", hi: "आपके खेत की मिट्टी किस प्रकार की है?", gu: "તમારા ખેતરની માટી કેવા પ્રકારની છે?" },
  question_water: { en: "How do you irrigate/water your crops?", hi: "आप फसलों की सिंचाई कैसे करते हैं?", gu: "તમે પાકને પાણી કેવી રીતે આપો છો?" },
  question_crops: { en: "What crops do you currently grow? (Select all that apply)", hi: "आप वर्तमान में कौन सी फसलें उगाते हैं? (सभी लागू चुनें)", gu: "તમે હાલમાં કયા પાક વાવો છો? (બધા લાગુ પડતા પસંદ કરો)" },
  question_goals: { en: "What is your main goal with planting trees?", hi: "पेड़ लगाने का आपका मुख्य उद्देश्य क्या है?", gu: "વૃક્ષો વાવવાનો તમારો મુખ્ય ઉદ્દેશ્ય શું છે?" },

  // Input Placeholder & Buttons
  input_placeholder: { en: "Ask VrikshaMitra a question (e.g. Will Teak grow in Rajkot?)...", hi: "वृक्ष मित्र से प्रश्न पूछें (जैसे: क्या राजकोट में सागवान उगेगा?)...", gu: "વૃક્ષમિત્રને પ્રશ્ન પૂછો (દા.ત. શું રાજકોટમાં સાગ ઉગશે?)..." },
  speak_prompt: { en: "Listening...", hi: "सुन रहा हूँ...", gu: "સાંભળી રહ્યું છે..." },
  soil_photo_btn: { en: "Upload soil photo for AI guess", hi: "मिट्टी का फोटो अपलोड करें (AI अनुमान के लिए)", gu: "માટીનો ફોટો અપલોડ કરો (AI અંદાજ માટે)" },
  use_my_location: { en: "Use my location", hi: "मेरी वर्तमान स्थिति का उपयोग करें", gu: "મારું વર્તમાન સ્થાન વાપરો" },

  // Species recommendation results
  rec_title: { en: "Recommended Trees for Your Farm", hi: "आपके खेत के लिए अनुशंसित पेड़", gu: "તમારા ખેતર માટે ભલામણ કરેલ વૃક્ષો" },
  rec_subtitle: { en: "Based on your location, soil type, crop compatibility, and goals.", hi: "आपके स्थान, मिट्टी के प्रकार, फसल अनुकूलता और उद्देश्यों के आधार पर।", gu: "તમારા સ્થાન, જમીનનો પ્રકાર, પાક સુસંગતતા અને ઉદ્દેશ્યોના આધારે." },
  view_details: { en: "View Details", hi: "विवरण देखें", gu: "વિગત જુઓ" },
  match_score: { en: "Match Score", hi: "अनुकूलता स्कोर", gu: "સુસંગતતા સ્કોર" },
  soil_match: { en: "Matches Soil", hi: "मिट्टी अनुकूल है", gu: "જમીન સાથે સુસંગત" },
  water_match: { en: "Matches Water", hi: "सिंचाई अनुकूल है", gu: "પિયત સાથે સુસંગત" },
  crop_match: { en: "Safe with Crops", hi: "फसलों के लिए सुरक्षित", gu: "પાક માટે અનુકૂળ" },
  goal_match: { en: "Fulfills Goal", hi: "उद्देश्य पूरा करता है", gu: "ઉદ્દેશ્ય પૂરો કરે છે" },
  crop_conflict: { en: "Crop Conflict Risk", hi: "फसल संघर्ष जोखिम", gu: "પાકને નુકસાનનું જોખમ" },

  // Species details
  income_timeline_title: { en: "Expected Income Timeline (Per Acre)", hi: "अनुमानित आय समय-सीमा (प्रति एकड़)", gu: "અંદાજિત આવક સમયરેખા (એકર દીઠ)" },
  harvest_cycle: { en: "Harvest Cycle", hi: "कटाई चक्र", gu: "પાકવાની સમયમર્યાદા" },
  years: { en: "Years", hi: "वर्ष", gu: "વર્ષ" },
  avoid_warning: { en: "Avoid planting alongside:", hi: "इनके साथ लगाने से बचें:", gu: "આ પાકો સાથે રોપણી ટાળો:" },
  good_cop_title: { en: "Compatible crops:", hi: "संगत फसलें:", gu: "સુસંગત પાકો:" },
  care_instructions: { en: "Agroforestry Care Instructions", hi: "कृषि वानिकी देखभाल निर्देश", gu: "કૃષિ વનીકરણ સારસંભાળ માર્ગદર્શન" },
  care_desc: { en: "Keep saplings watered weekly for the first 6 months. Prune lower side-branches to encourage straight pole growth and allow light for crops. Clear weeds around the base.", hi: "पहले 6 महीनों के लिए पौधों को साप्ताहिक रूप से पानी दें। सीधे तने के विकास और फसलों के लिए धूप सुनिश्चित करने के लिए निचली टहनियों की छंटाई करें। आधार के आसपास खरपतवार साफ रखें।", gu: "શરૂઆતના ૬ મહિના સુધી રોપાને અઠવાડિયે પાણી આપો. લાકડું સીધું વધે અને પાકને તડકો મળે તે માટે નીચેની ડાળીઓ કાપતા રહો. થડની આસપાસ નિંદામણ દૂર કરો." },

  // Scheme
  scheme_matcher_title: { en: "Government Subsidies & Schemes Finder", hi: "सरकारी सब्सिडी और योजनाएं", gu: "સરકારી સબસિડી અને યોજનાઓ" },
  scheme_eligible: { en: "Matched Subsidy Schemes", hi: "पात्र सब्सिडी योजनाएं", gu: "પાત્ર સબસિડી યોજનાઓ" },
  docs_checklist: { en: "Required Documents Checklist", hi: "आवश्यक दस्तावेजों की चेकलिस्ट", gu: "જરૂરી દસ્તાવેજોની ચકાસણી યાદી" },
  generate_summary: { en: "Generate My Application Summary", hi: "मेरा आवेदन सारांश तैयार करें", gu: "મારું અરજી પત્રક તૈયાર કરો" },
  checklist_placeholder: { en: "Check off the papers you have ready:", hi: "आपके पास तैयार दस्तावेजों पर सही का निशान लगाएं:", gu: "તમારી પાસે તૈયાર દસ્તાવેજો પર ખરાની નિશાની કરો:" },

  // My Plan
  my_plan_title: { en: "Your Agroforestry Action Plan", hi: "आपकी कृषि वानिकी कार्य योजना", gu: "તમારી કૃષિ વનીકરણ કાર્ય યોજના" },
  print_btn: { en: "Print Summary", hi: "सारांश प्रिंट करें", gu: "પત્રક પ્રિન્ટ કરો" },
  whatsapp_share: { en: "Share via WhatsApp", hi: "व्हाट्सएप पर साझा करें", gu: "વોટ્સએપ પર શેર કરો" },
  no_plan_yet: { en: "You haven't saved any trees or schemes yet. Go to Chat to start!", hi: "आपने अभी तक कोई पेड़ या योजना सहेज नहीं की है। शुरू करने के लिए चैट पर जाएं!", gu: "તમે હજી કોઈ વૃક્ષ કે યોજના સેવ કરી નથી. શરૂ કરવા માટે ચેટ પર જાઓ!" },

  // Soil type translations
  soil_loamy: { en: "Loamy (Gorado)", hi: "दूमट मिट्टी (लोमी)", gu: "ગોરાડુ માટી (લોમી)" },
  soil_black_cotton: { en: "Black Cotton (Regur)", hi: "काली मिट्टी (रेगुर)", gu: "કાળી માટી (રેગુર)" },
  soil_sandy: { en: "Sandy (Retal)", hi: "रेतीली मिट्टी", gu: "રેતાળ માટી" },
  soil_saline: { en: "Saline (Kharash)", hi: "खारी मिट्टी", gu: "ખારાશવાળી માટી" },
  soil_clayey: { en: "Clayey (Kapan)", hi: "चिकनी मिट्टी", gu: "ચીકણી માટી" },

  // Water source translations
  water_rainfed: { en: "Rainfed Only", hi: "केवल वर्षा आधारित", gu: "માત્ર વરસાદ આધારિત" },
  water_well: { en: "Well / Borewell", hi: "कुआं / बोरवेल", gu: "કૂવો / બોરવેલ" },
  water_canal: { en: "Canal System", hi: "नहर (कनाल)", gu: "કેનાલ (નહેર)" },
  water_drip: { en: "Drip Irrigation", hi: "टपक सिंचाई (ड्रिप)", gu: "ટપક પિયત પદ્ધતિ (ડ્રિપ)" },

  // Goals translation
  goal_fodder: { en: "Fodder for animals", hi: "पशुओं के लिए चारा", gu: "પશુઓ માટે ઘાસચારો" },
  goal_fuelwood: { en: "Fuelwood / Firewood", hi: "ईंधन की लकड़ी", gu: "બળતણ લાકડું" },
  goal_income: { en: "Extra Income (Timber/Pulp)", hi: "अतिरिक्त आय (लकड़ी)", gu: "વધારાની આવક (ઇમારતી લાકડું)" },
  goal_soil_improvement: { en: "Improve Soil Fertility", hi: "मिट्टी की उर्वरता बढ़ाएं", gu: "જમીનની ફળદ્રુપતા વધારવી" },
  goal_shade: { en: "Shade & Wind Protection", hi: "छाया और हवा से सुरक्षा", gu: "છાંયો અને પવનથી રક્ષણ" },
  goal_fruit: { en: "Fruits for family/sale", hi: "खाने/बेचने के लिए फल", gu: "ખાવા/વેચવા માટે ફળો" },

  // Crops translation
  crop_cotton: { en: "Cotton (Kapas)", hi: "कपास", gu: "કપાસ" },
  crop_groundnut: { en: "Groundnut (Magfali)", hi: "मूंगफली", gu: "મગફળી" },
  crop_wheat: { en: "Wheat (Ghaum)", hi: "गेहूं", gu: "ઘઉં" },
  crop_bajra: { en: "Bajra (Millet)", hi: "बाजरा", gu: "બાજરી" },
  crop_mustard: { en: "Mustard (Rai)", hi: "सरसों", gu: "રાઈ" },
  crop_pulses: { en: "Pulses (Tuver/Moong)", hi: "दालें (तुअर/मूंग)", gu: "કઠોળ (તુવેર/મગ)" },
  crop_sugarcane: { en: "Sugarcane (Sherdi)", hi: "गन्ना (शेरडी)", gu: "શેરડી" },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("gu");
  const [profile, setProfileState] = useState<FarmerProfile>(defaultProfile);
  const [savedPlan, setSavedPlanState] = useState<SavedPlan>(defaultPlan);

  useEffect(() => {
    const savedLang = localStorage.getItem("vriksha_lang") as Language;
    if (savedLang) setLanguageState(savedLang);

    const savedProf = localStorage.getItem("vriksha_profile");
    if (savedProf) setProfileState(JSON.parse(savedProf));

    const savedPl = localStorage.getItem("vriksha_plan");
    if (savedPl) setSavedPlanState(JSON.parse(savedPl));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("vriksha_lang", lang);
  };

  const updateProfile = (updates: Partial<FarmerProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("vriksha_profile", JSON.stringify(next));
      return next;
    });
  };

  const saveSpecies = (speciesId: string) => {
    setSavedPlanState((prev) => {
      if (prev.speciesIds.includes(speciesId)) return prev;
      const next = { ...prev, speciesIds: [...prev.speciesIds, speciesId] };
      localStorage.setItem("vriksha_plan", JSON.stringify(next));
      return next;
    });
  };

  const removeSpecies = (speciesId: string) => {
    setSavedPlanState((prev) => {
      const next = { ...prev, speciesIds: prev.speciesIds.filter((id) => id !== speciesId) };
      localStorage.setItem("vriksha_plan", JSON.stringify(next));
      return next;
    });
  };

  const saveScheme = (schemeId: string | null) => {
    setSavedPlanState((prev) => {
      const next = { ...prev, schemeId };
      localStorage.setItem("vriksha_plan", JSON.stringify(next));
      return next;
    });
  };

  const toggleDocument = (docId: string) => {
    setSavedPlanState((prev) => {
      const activeDocs = prev.documentsChecked.includes(docId)
        ? prev.documentsChecked.filter((id) => id !== docId)
        : [...prev.documentsChecked, docId];
      const next = { ...prev, documentsChecked: activeDocs };
      localStorage.setItem("vriksha_plan", JSON.stringify(next));
      return next;
    });
  };

  const clearPlan = () => {
    setSavedPlanState(defaultPlan);
    setProfileState(defaultProfile);
    localStorage.removeItem("vriksha_profile");
    localStorage.removeItem("vriksha_plan");
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key]["en"];
    }
    return key;
  };

  const convertLandToAcres = (size: number, unit: "acre" | "bigha" | "hectare"): number => {
    if (unit === "acre") return size;
    if (unit === "hectare") return size * 2.47;
    if (unit === "bigha") return size * 0.4; // 2.5 bigha = 1 acre
    return size;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        profile,
        updateProfile,
        savedPlan,
        saveSpecies,
        removeSpecies,
        saveScheme,
        toggleDocument,
        clearPlan,
        t,
        convertLandToAcres,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
