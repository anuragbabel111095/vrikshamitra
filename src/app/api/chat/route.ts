import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Load species and schemes data helper
const loadData = () => {
  try {
    const speciesPath = path.join(process.cwd(), "src/data/species.json");
    const schemesPath = path.join(process.cwd(), "src/data/schemes.json");
    
    const speciesData = JSON.parse(fs.readFileSync(speciesPath, "utf8"));
    const schemesData = JSON.parse(fs.readFileSync(schemesPath, "utf8"));
    return { speciesData, schemesData };
  } catch (err) {
    console.error("Error reading JSON databases:", err);
    return { speciesData: [], schemesData: [] };
  }
};

export async function POST(req: Request) {
  try {
    const { message, language, profile } = await handleReqBody(req);
    const { speciesData, schemesData } = loadData();

    // Setup Gemini API client
    const apiKey = process.env.GEMINI_API_KEY || "";
    
    // Construct localized instructions
    const langLabel = language === "gu" ? "Gujarati" : language === "hi" ? "Hindi" : "English";
    
    const systemPrompt = `
You are VrikshaMitra, a friendly agroforestry advisor for farmers in Gujarat, India.
You help farmers choose trees to plant on farm bunds and boundaries alongside their crops,
understand expected income, and find the right government scheme.

Rules:
- Always answer in the farmer's selected language (${langLabel}). Keep language simple, warm, and respectful — as if talking to a respected elder farmer.
- Only recommend species and cite scheme details that appear in the provided SPECIES_DATA and SCHEME_DATA JSON. Never invent species, subsidy amounts, or scheme names.
- Always explain WHY you're recommending something (soil match, water match, income goal match) in one short sentence.
- Keep every response under 4 sentences unless the farmer asks for more detail.
- If you don't have enough information (e.g. soil type unknown), ask ONE clarifying question at a time.
- Never guarantee exact income figures — always frame as estimates ("could earn approximately...").
- If asked something outside agroforestry/farming, politely redirect to what you can help with.

Farmer profile: ${JSON.stringify(profile)}
Available species data: ${JSON.stringify(speciesData)}
Available scheme data: ${JSON.stringify(schemesData)}
`;

    // Check if API key exists. If not, use a rule-based mock matching response to ensure v1 works perfectly without key dependencies!
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Using matching-engine fallback logic.");
      const reply = getFallbackResponse(message, language, profile, speciesData, schemesData);
      return NextResponse.json({ reply });
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Call Gemini API
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `System Instruction: ${systemPrompt}` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will act as VrikshaMitra and adhere to these boundaries, guidelines, and database contexts strictly." }]
        }
      ]
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Gemini API server route error:", error);
    return NextResponse.json({ error: "Failed to communicate with AI model" }, { status: 500 });
  }
}

async function handleReqBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return { message: "", language: "gu", profile: {} };
  }
}

// Highly customized rule-based mock engine to handle conversations and questions locally if API key is not present.
function getFallbackResponse(
  query: string,
  lang: string,
  profile: any,
  species: any[],
  schemes: any[]
): string {
  const q = query.toLowerCase();

  // Helper translations for fallback
  const fallbacks: Record<string, Record<string, string>> = {
    redirect: {
      en: "I am VrikshaMitra, your agroforestry advisor. I can only help you with choosing boundary trees, farm incomes, nurseries, and government forestry schemes in Gujarat. How can I assist you with planting trees on your farm?",
      hi: "मैं वृक्ष मित्र हूँ, आपका कृषि वानिकी सलाहकार। मैं केवल गुजरात में मेढ़ों पर पेड़ लगाने, कृषि आय, सरकारी योजनाओं और नर्सरी के बारे में सहायता कर सकता हूँ। मैं पेड़ लगाने में आपकी क्या मदद कर सकता हूँ?",
      gu: "હું વૃક્ષમિત્ર છું, તમારો કૃષિ વનીકરણ માર્ગદર્શક. હું માત્ર ખેતરના શેઢા પર વૃક્ષારોપણ, પિયત, સરકારી સહાય અને સરકારી ડેપો/નર્સરી વિશે માહિતી આપી શકું. હું ખેતરમાં વૃક્ષો વાવવામાં આપને શું મદદ કરું?"
    },
    default: {
      en: "Based on your query, planting trees like Neem and Subabul on your boundary yields high value and matches your loamy soil. You can also match with 'Har Medh Par Ped' scheme for a Rs. 70 subsidy per tree.",
      hi: "आपके प्रश्न के अनुसार, आपकी मेढ़ पर नीम और सुबबूल जैसे पेड़ लगाना अत्यधिक मूल्यवान है जो आपकी दोमट मिट्टी के अनुकूल है। आप प्रति पेड़ 70 रुपये की सब्सिडी के लिए 'हर मेढ़ पर पेड़' योजना का लाभ उठा सकते हैं।",
      gu: "તમારા પ્રશ્ન અનુસાર, શેઢા-પાળ પર લીમડો કે સુબાવલ વાવવો ખૂબ ફાયદાકારક છે અને તે તમારી માટી સાથે સુસંગત છે. તમે વૃક્ષ દીઠ રૂ. ૭૦ ની સહાય માટે 'હર મેઢ પર પેડ' યોજનાનો લાભ લઈ શકો છો."
    }
  };

  // Check redirects
  if (
    q.includes("cricket") ||
    q.includes("movie") ||
    q.includes("song") ||
    q.includes("weather") ||
    q.includes("modi") ||
    q.includes("news")
  ) {
    return fallbacks.redirect[lang] || fallbacks.redirect["en"];
  }

  // Look for species details match
  for (const s of species) {
    const nameEn = s.name.en.toLowerCase();
    const nameHi = s.name.hi;
    const nameGu = s.name.gu;
    
    if (q.includes(nameEn) || q.includes(nameHi) || q.includes(nameGu) || q.includes(s.id)) {
      const desc = s.description[lang] || s.description["en"];
      const cycle = s.harvest_cycle_years;
      const water = s.water_need;
      
      if (lang === "gu") {
        return `${s.name.gu} એ એક ઉત્તમ વૃક્ષ છે. તેનો પાકવાનો ગાળો ${cycle} વર્ષનો છે અને તેની પાણીની જરૂરિયાત ${water === "low" ? "ઓછી" : "મધ્યમ"} છે. તે તમારા શેઢા માટે યોગ્ય છે.`;
      } else if (lang === "hi") {
        return `${s.name.hi} एक उत्कृष्ट वृक्ष है। इसका कटाई चक्र ${cycle} वर्षों का है और पानी की आवश्यकता ${water === "low" ? "कम" : "मध्यम"} है। यह आपकी मेढ़ के लिए अनुकूल है।`;
      } else {
        return `${s.name.en} is an excellent tree choice. It has a harvest cycle of ${cycle} years with ${water} water requirements. It matches your boundary profile perfectly.`;
      }
    }
  }

  // Look for scheme details match
  for (const sc of schemes) {
    const scId = sc.id;
    const scEn = sc.name.en.toLowerCase();
    const scHi = sc.name.hi;
    const scGu = sc.name.gu;

    if (q.includes(scId) || q.includes(scEn) || q.includes(scHi) || q.includes(scGu) || q.includes("scheme") || q.includes("subsidy") || q.includes("મદદ") || q.includes("સબસિડી") || q.includes("योजना")) {
      const amt = sc.subsidy_amount[lang] || sc.subsidy_amount["en"];
      const dept = sc.department[lang] || sc.department["en"];
      
      if (lang === "gu") {
        return `તમે ${sc.name.gu} નો લાભ મેળવી શકો છો. સબસિડી સહાય: ${amt}. આ યોજના ${dept} દ્વારા અમલમાં છે.`;
      } else if (lang === "hi") {
        return `आप ${sc.name.hi} का लाभ उठा सकते हैं। सब्सिडी राशि: ${amt}. यह ${dept} द्वारा प्रबंधित है.`;
      } else {
        return `You can apply for the ${sc.name.en}. It offers a subsidy of ${amt}. It is administered by the ${dept}.`;
      }
    }
  }

  return fallbacks.default[lang] || fallbacks.default["en"];
}
