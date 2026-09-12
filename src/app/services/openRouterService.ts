// ── OpenRouter AI Agent Service for ImmigrantConnect / Pathasathi Assistant ──

export interface ServiceTypeSuggestion {
  id: string | number;
  title: string;
  bnTitle: string;
  category: string;
  searchQuery: string;
  typeLabel?: string;
  bnTypeLabel?: string;
  actionText?: string;
  actionTextEn?: string;
}

export interface OpenRouterAgentResponse {
  explanation: string;
  category: string;
  suggestionHeader?: string;
  serviceTypes: ServiceTypeSuggestion[];
  isAiGenerated: boolean;
  destination?: { name: string; route: string; state?: any };
}

// ── Verified Service Types & Categories for Direct Map Navigation ─────────────
export const VERIFIED_SERVICE_TYPES: Record<string, ServiceTypeSuggestion[]> = {
  jobs: [
    {
      id: "job-warehouse",
      title: "Warehouse & Logistics jobs",
      bnTitle: "ওয়্যারহাউস ও লজিস্টিকস কাজ",
      typeLabel: "Warehouse & Logistics",
      bnTypeLabel: "ওয়্যারহাউস ও প্যাকেজিং",
      category: "jobs",
      searchQuery: "warehouse",
      actionText: "লজিস্টিকস ও ওয়্যারহাউস কাজের সরাসরি সুযোগ দেখতে [লিংকে ক্লিক] করুন।",
      actionTextEn: "To explore warehouse and logistics job opportunities, try [clicking this link].",
    },
    {
      id: "job-delivery",
      title: "Driver & Delivery jobs",
      bnTitle: "ড্রাইভার ও ডেলিভারি কাজ",
      typeLabel: "Delivery & Courier",
      bnTypeLabel: "ড্রাইভিং ও ফুড ডেলিভারি",
      category: "jobs",
      searchQuery: "delivery driver",
      actionText: "ড্রাইভার ও ফুড ডেলিভারি পদের সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Find driver and courier delivery openings by [clicking this link].",
    },
    {
      id: "job-restaurant",
      title: "Restaurant & Kitchen staff jobs",
      bnTitle: "রেস্তোরাঁ ও কিচেন কাজ",
      typeLabel: "Restaurant & Kitchen",
      bnTypeLabel: "রেস্তোরাঁ ও ফুড সার্ভিস",
      category: "jobs",
      searchQuery: "restaurant cook kitchen",
      actionText: "রেস্তোরাঁ ও কিচেন সহকারী পদের তথ্যের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Access restaurant and kitchen staff positions by [clicking this link].",
    },
    {
      id: "job-retail",
      title: "Retail Store & Cashier jobs",
      bnTitle: "রিটেইল স্টোর ও ক্যাশিয়ার কাজ",
      typeLabel: "Retail & Sales",
      bnTypeLabel: "গ্রোসারি ও রিটেইল সেলস",
      category: "jobs",
      searchQuery: "retail cashier sales",
      actionText: "সুপারমার্কেট ক্যাশিয়ার ও রিটেইল সেলস কাজের জন্য [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Check out supermarket cashier and retail positions by [clicking this link].",
    },
    {
      id: "job-technician",
      title: "Maintenance & Technician jobs",
      bnTitle: "কনস্ট্রাকশন ও টেকনিশিয়ান কাজ",
      typeLabel: "Technician & Labor",
      bnTypeLabel: "টেকনিশিয়ান ও মেইনটেন্যান্স",
      category: "jobs",
      searchQuery: "technician maintenance",
      actionText: "মেইনটেন্যান্স ও টেকনিশিয়ান পদের বর্তমান চাহিদা দেখতে [লিংকে ক্লিক] করুন।",
      actionTextEn: "View maintenance and technician job openings by [clicking this link].",
    },
  ],
  greencard_legal: [
    {
      id: "legal-family",
      title: "Family Green Card & I-130 Petition services",
      bnTitle: "পারিবারিক গ্রিন কার্ড ও আই-১৩০ আবেদন সেবা",
      typeLabel: "Family Green Card",
      bnTypeLabel: "পারিবারিক গ্রিন কার্ড",
      category: "lawyer",
      searchQuery: "green card lawyer",
      actionText: "পারিবারিক গ্রিন কার্ড (I-130) পিটিশন ও আইনি পরামর্শের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Access family green card (I-130) legal assistance by [clicking this link].",
    },
    {
      id: "legal-asylum",
      title: "Asylum & Work Permit (EAD) legal defense",
      bnTitle: "রাজনৈতিক আশ্রয় ও ওয়ার্ক পারমিট (EAD) আইনি সেবা",
      typeLabel: "Asylum & Work Permit",
      bnTypeLabel: "অ্যাসাইলাম ও ওয়ার্ক পারমিট",
      category: "lawyer",
      searchQuery: "asylum legal aid",
      actionText: "রাজনৈতিক আশ্রয় ও ওয়ার্ক পারমিট ডিফেন্স আইনজীবীদের সাথে যোগাযোগের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Connect with asylum and work permit defense attorneys by [clicking this link].",
    },
    {
      id: "legal-probono",
      title: "Free Pro-Bono Legal Aid & Court defense",
      bnTitle: "ফ্রি লিগ্যাল এইড ও কোর্ট ডিফেন্স সেবা",
      typeLabel: "Free Pro-Bono Aid",
      bnTypeLabel: "ফ্রি লিগ্যাল এইড",
      category: "lawyer",
      searchQuery: "legal aid",
      actionText: "সম্পূর্ণ বিনামূল্যে প্রো-বোনো আইনি সহায়তার জন্য [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Discover free pro-bono legal aid organizations by [clicking this link].",
    },
    {
      id: "legal-citizenship",
      title: "Citizenship & Fee Waiver clinic services",
      bnTitle: "সিটিজেনশিপ প্রসেসিং ও আবেদন ফি মওকুফ সেবা",
      typeLabel: "Citizenship Clinic",
      bnTypeLabel: "সিটিজেনশিপ ও ফি মওকুফ",
      category: "lawyer",
      searchQuery: "citizenship clinic",
      actionText: "সিটিজেনশিপ প্রসেসিং ও আবেদন ফি মওকুফ ক্লিনিকের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Find citizenship clinics and fee waiver assistance by [clicking this link].",
    },
  ],
  asylum_tps: [
    {
      id: "asylum-filing",
      title: "Political Asylum (Form I-589) filing services",
      bnTitle: "পলিটিক্যাল অ্যাসাইলাম (I-589) আবেদন সেবা",
      typeLabel: "Asylum Application",
      bnTypeLabel: "অ্যাসাইলাম আবেদন",
      category: "lawyer",
      searchQuery: "asylum defense",
      actionText: "অ্যাসাইলাম আবেদন (Form I-589) সরাসরি ফাইলিং সহায়তায় [লিংকে ক্লিক] করুন।",
      actionTextEn: "Find Form I-589 asylum filing and defense services by [clicking this link].",
    },
    {
      id: "asylum-ead",
      title: "Work Permit (Form I-765) renewal services",
      bnTitle: "ওয়ার্ক পারমিট (EAD) নবায়ন ও ফি মওকুফ সেবা",
      typeLabel: "Work Permit EAD",
      bnTypeLabel: "ওয়ার্ক পারমিট নবায়ন",
      category: "lawyer",
      searchQuery: "work permit ead",
      actionText: "ওয়ার্ক পারমিট (EAD) আবেদন ও নবায়নের তথ্যের জন্য [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Explore work permit (EAD) filing and renewal options by [clicking this link].",
    },
    {
      id: "asylum-court",
      title: "Immigration Court & Deportation Defense",
      bnTitle: "ইমিগ্রেশন কোর্ট ও ডিপোর্টেশন ডিফেন্স সেবা",
      typeLabel: "Court Defense",
      bnTypeLabel: "কোর্ট ডিফেন্স",
      category: "lawyer",
      searchQuery: "court defense lawyer",
      actionText: "ইমিগ্রেশন কোর্ট ডেট ও ডিপোর্টেশন ডিফেন্সের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Connect with immigration court trial defense lawyers by [clicking this link].",
    },
  ],
  dmv_license: [
    {
      id: "dmv-greenlight",
      title: "Green Light Driver License services",
      bnTitle: "গ্রিন লাইট ড্রাইভিং লাইসেন্স সেবা",
      typeLabel: "Green Light License",
      bnTypeLabel: "গ্রিন লাইট লাইসেন্স",
      category: "dmv",
      searchQuery: "dmv green light license",
      actionText: "গ্রিন লাইট ড্রাইভিং লাইসেন্স নির্দেশিকা ও ডিএমভি সেন্টারের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Find NY Green Light driver license locations by [clicking this link].",
    },
    {
      id: "dmv-permit",
      title: "Learner Permit & Written Exam testing services",
      bnTitle: "লার্নার পারমিট ও লিখিত পরীক্ষা সেবা",
      typeLabel: "Learner Permit",
      bnTypeLabel: "লার্নার পারমিট টেস্ট",
      category: "dmv",
      searchQuery: "dmv permit test",
      actionText: "লার্নার পারমিট টেস্ট প্রস্তুতি ও অ্যাপয়েন্টমেন্ট বুকিং করতে [লিংকে ক্লিক] করুন।",
      actionTextEn: "Schedule your learner permit written test by [clicking this link].",
    },
    {
      id: "dmv-stateid",
      title: "Non-Driver NY State ID Card services",
      bnTitle: "নিউইয়র্ক স্টেট আইডি কার্ড সেবা",
      typeLabel: "State ID Card",
      bnTypeLabel: "স্টেট আইডি কার্ড",
      category: "dmv",
      searchQuery: "dmv state id",
      actionText: "নিউ ইয়র্ক নন-ড্রাইভার স্টেট আইডি কার্ডের বিস্তারিত তথ্যে [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Locate NY non-driver state ID card centers by [clicking this link].",
    },
  ],
  halal_food: [
    {
      id: "halal-meat",
      title: "Fresh Zabiha Halal Meat markets",
      bnTitle: "তাজা জবিহা হালাল মাংস ও দেশি গ্রোসারি",
      typeLabel: "Halal Meat & Market",
      bnTypeLabel: "হালাল মাংস ও গ্রোসারি",
      category: "groceries",
      searchQuery: "halal meat grocery",
      actionText: "তাজা জবিহা হালাল মাংস ও দেশি গ্রোসারি শপের সন্ধান পেতে [লিংকে ক্লিক] করুন।",
      actionTextEn: "Locate fresh Zabihah halal butcher shops by [clicking this link].",
    },
    {
      id: "halal-fish",
      title: "Bangladeshi Grocery & Fish markets",
      bnTitle: "আমদানিকৃত বাংলাদেশি গ্রোসারি ও দেশি মাছ",
      typeLabel: "Bangladeshi Grocery",
      bnTypeLabel: "দেশি মাছ ও নিত্যপণ্য",
      category: "groceries",
      searchQuery: "bangladeshi grocery",
      actionText: "পদ্মার ইলিশ ও আমদানিকৃত বাংলাদেশি পণ্যের বাজারের জন্য [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Find authentic Bangladeshi fish and grocery markets by [clicking this link].",
    },
    {
      id: "halal-dining",
      title: "Halal Restaurant & Biryani spots",
      bnTitle: "হালাল খাবার ও বিরিয়ানি রেস্তোরাঁ",
      typeLabel: "Halal Dining",
      bnTypeLabel: "হালাল বিরিয়ানি ও রেস্তোরাঁ",
      category: "restaurant",
      searchQuery: "halal restaurant biryani",
      actionText: "খাঁটি হালাল বিরিয়ানি ও দেশি খাবারের রেস্তোরাঁ দেখতে [লিংকে ক্লিক] করুন।",
      actionTextEn: "Discover halal dining and biryani spots by [clicking this link].",
    },
  ],
  healthcare: [
    {
      id: "health-nyccare",
      title: "NYC Care low-cost doctor & primary healthcare services",
      bnTitle: "NYC কেয়ার স্বল্পমূল্যে ডাক্তার ও স্বাস্থ্যসেবা",
      typeLabel: "NYC Care Doctor",
      bnTypeLabel: "NYC কেয়ার ডাক্তার",
      category: "hospital",
      searchQuery: "nyc care clinic",
      actionText: "NYC Care স্বল্পমূল্যে প্রাইমারি ডাক্তার ও ক্লিনিক সার্ভিসের জন্য [লিংকে ক্লিক] করুন।",
      actionTextEn: "Enroll in NYC Care low-cost primary doctor services by [clicking this link].",
    },
    {
      id: "health-emergency",
      title: "Emergency Room hospital services without status check",
      bnTitle: "স্ট্যাটাস যাচাই ছাড়া জরুরি হাসপাতাল চিকিৎসা সেবা",
      typeLabel: "Emergency Hospital",
      bnTypeLabel: "জরুরি হাসপাতাল সেবা",
      category: "hospital",
      searchQuery: "emergency hospital",
      actionText: "স্ট্যাটাস বা আইডি যাচাই ছাড়া জরুরি হাসপাতালের সেবায় [লিংকে ক্লিক] করুন।",
      actionTextEn: "Find confidential emergency room and hospital care by [clicking this link].",
    },
    {
      id: "health-clinic",
      title: "Community Free Clinic & Prescription support",
      bnTitle: "বিনামূল্যে হেলথ চেকআপ ও প্রেসক্রিপশন সেবা",
      typeLabel: "Free Health Clinic",
      bnTypeLabel: "ফ্রি হেলথ ক্লিনিক",
      category: "hospital",
      searchQuery: "free health clinic",
      actionText: "বিনামূল্যে কমিউনিটি হেলথ চেকআপ ও প্রেসক্রিপশন সহায়তায় [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Connect with free community healthcare clinics by [clicking this link].",
    },
  ],
  housing: [
    {
      id: "housing-sublet",
      title: "Room rental & sublet housing without credit check",
      bnTitle: "ক্রেডিট হিস্টোরি ছাড়া রুম ও সাবলেট আবাসন",
      typeLabel: "Sublet & Rooms",
      bnTypeLabel: "রুম ও সাবলেট ভাড়া",
      category: "housing",
      searchQuery: "sublet housing",
      actionText: "নো-ক্রেডিট চেক সাশ্রয়ী রুম ও সাবলেট ভাড়ার সরাসরি সন্ধানে [লিংকে ক্লিক] করুন।",
      actionTextEn: "Find room rentals and sublets without credit check by [clicking this link].",
    },
    {
      id: "housing-rights",
      title: "Free Tenant Rights & Eviction Defense counseling services",
      bnTitle: "ভাড়াটিয়াদের আইনি অধিকার ও উচ্ছেদ প্রতিরোধ সেবা",
      typeLabel: "Tenant Protections",
      bnTypeLabel: "ভাড়াটিয়ার আইনি অধিকার",
      category: "housing",
      searchQuery: "tenant rights housing",
      actionText: "ভাড়াটিয়াদের আইনি অধিকার ও উচ্ছেদ প্রতিরোধ কাউন্সেলিংয়ের তথ্যে [লিংকে ক্লিক] করুন।",
      actionTextEn: "Access free tenant rights and eviction defense support by [clicking this link].",
    },
  ],
  mosque: [
    {
      id: "mosque-prayer",
      title: "Daily 5x Prayer & Friday Jummah congregational services",
      bnTitle: "দৈনিক ৫ ওয়াক্ত নামাজ ও জুম্মা জামাত",
      typeLabel: "Daily Prayer & Jummah",
      bnTypeLabel: "দৈনিক নামাজ ও জুম্মা",
      category: "mosque",
      searchQuery: "mosque prayer",
      actionText: "নিকটস্থ মসজিদ ও জামাতের সময়সূচী জানতে [লিংকে ক্লিক] করুন।",
      actionTextEn: "Find nearby mosques and daily prayer times by [clicking this link].",
    },
    {
      id: "mosque-community",
      title: "Newcomer Halal Food Pantry & community social services",
      bnTitle: "নতুন প্রবাসীদের সহায়তা ও হালাল ফুড প্যান্ট্রি সেবা",
      typeLabel: "Community Services",
      bnTypeLabel: "সোশ্যাল সার্ভিস ও প্যান্ট্রি",
      category: "mosque",
      searchQuery: "islamic community center",
      actionText: "ইসলামিক সেন্টার ও হালাল ফুড প্যান্ট্রি সেবার তথ্যে [লিংকে ক্লিক] করতে পারেন।",
      actionTextEn: "Access newcomer community support and food pantries by [clicking this link].",
    },
  ],
};

// OpenRouter API Configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY =
  (import.meta as any).env?.VITE_OPENROUTER_API_KEY || "";

const PRIMARY_MODEL = "openai/gpt-4o-mini";
const FALLBACK_MODEL = "deepseek/deepseek-chat";

/**
 * System prompt instructing Pathasathi to act as an authoritative, empathetic
 * immigrant AI Agent for New York & nationwide USA resources.
 */
const SYSTEM_PROMPT = `You are "Pathasathi" (পথসাথী), an intelligent AI Agent and Navigator for immigrants in New York and across the United States.
Your goal is to act like a real, expert immigrant guide and advisor. Understand EXACTLY what the user is asking and provide deeply tailored, realistic, and highly relevant responses.

CRITICAL INSTRUCTIONS:

1. LANGUAGE:
   - If the user writes in Bengali or Banglish (e.g. "ami driving kaj chai", "greencard kivabe pabo", "room rent nite chai", "ami babysitter er kaj chai", "bengali doctor dorkar"), respond in warm, natural, helpful Bengali (বাংলা).
   - If the user writes in English, respond in English.

2. EXPLANATION:
   - Provide a comprehensive, structured, helpful guide (2-4 well-explained paragraphs with bold headings, bullet points, required documents, pay/market rate, safety tips, and actionable advice).
   - Never output single specific office addresses or exact pinpoint coordinates in the text.

3. DYNAMIC & VARIED SUGGESTIONS (ABSOLUTELY NO MONOTONOUS TEMPLATES):
   - You MUST generate 3 to 5 suggestions specifically tailored to what the user asked.
   - ❌ NEVER repeat the same sentence structure or formula across items!
     DO NOT write:
     - "এই [লিংকে ক্লিক] করলে আপনি ফুল-টাইম কাজের সুযোগ দেখতে পাবেন।"
     - "এই [লিংকে ক্লিক] করলে আপনি পার্ট-টাইম কাজের সুযোগ দেখতে পাবেন।"
     - "এই [লিংকে ক্লিক] করলে আপনি ন্যানি কাজের সুযোগ দেখতে পাবেন।"
     (This is a repetitive template and is strictly forbidden!)
     
   - ✅ DO write varied, natural human phrasing addressing distinct aspects of their request:
     - "নিউ ইয়র্কের দেশি ফ্যামিলি ও চাইল্ডকেয়ার এজেন্সির সুযোগ দেখতে [লিংকে ক্লিক] করুন।"
     - "বিভিন্ন রেজিস্টার্ড ডে-কেয়ার সেন্টারে অ্যাসিস্ট্যান্ট পদের সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।"
     - "কাজের রেট ও গ্রহণযোগ্যতা বাড়াতে জরুরি CPR ও ফার্স্ট-এইড ট্রেনিং সেন্টারের তথ্য জানতে [লিংকে ক্লিক] করুন।"
     - "হোম অ্যাটেনডেন্ট ও প্রাইভেট ন্যানি পদের জন্য [লিংকে ক্লিক] করে বিস্তারিত যাচাই করুন।"

   - Cover different practical angles of the user's request:
     * Specific job roles / sub-niches (e.g. entry-level, agency, direct family, corporate)
     * Prerequisites / Certifications / Training needed (e.g. OSHA for construction, CPR for babysitting, TLC for driving, Food Protection Certificate for cooking)
     * Community networks, legal protections, or local resources in the relevant neighborhoods (Jackson Heights, Jamaica, Astoria, Parkchester, Paterson, etc.)

4. SUGGESTION FORMAT:
   - "suggestionHeader": A natural, engaging title tailored to the subject (e.g. "আপনার জন্য বেবিসিটিং ও চাইল্ডকেয়ারের দরকারি লিংক:", "নিউ ইয়র্কে আইটি চাকরি খোঁজার প্রাসঙ্গিক অপশন:", "জ্যাকসন হাইটসে সাশ্রয়ী রুম ও আবাসন লিংক:")
   - "title" & "bnTitle": Clean, concise name of the specific service/job/resource
   - "actionText": A varied, natural sentence in Bengali where "[লিংকে ক্লিক]" represents the clickable red link
   - "actionTextEn": A varied, natural sentence in English where "[clicking this link]" represents the clickable red link
   - "searchQuery": Effective search terms to filter on the map
   - "category": One of 'jobs', 'lawyer', 'dmv', 'hospital', 'housing', 'groceries', 'restaurant', 'mosque'

OUTPUT JSON SCHEMA:
{
  "explanation": "<Comprehensive, helpful markdown explanation in user's language>",
  "category": "<jobs, lawyer, dmv, hospital, housing, groceries, restaurant, mosque>",
  "suggestionHeader": "<Engaging, topic-specific header>",
  "suggestions": [
    {
      "id": "1",
      "title": "<Specific English service/job/resource name>",
      "bnTitle": "<Specific Bengali service/job/resource name>",
      "actionText": "<Natural, non-templated Bengali sentence with '[লিংকে ক্লিক]'>",
      "actionTextEn": "<Natural, non-templated English sentence with '[clicking this link]'>",
      "category": "<jobs, lawyer, dmv, hospital, housing, groceries, restaurant, mosque>",
      "searchQuery": "<keyword for map search filter>"
    }
  ]
};`;

/**
 * Call OpenRouter API with conversational multi-turn context
 */
export async function callOpenRouterAgent(
  userQuery: string,
  userLang: string,
  chatHistory: { sender: "bot" | "user"; text: string }[] = []
): Promise<OpenRouterAgentResponse> {
  const query = userQuery.trim();

  // Format previous conversation context (last 4 turns max)
  const recentHistory = chatHistory.slice(-4).map((msg) => ({
    role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: "user" as const, content: query },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin || "https://immigrantconnect.app",
        "X-Title": "Pathasathi AI Agent",
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(
        `OpenRouter primary model ${PRIMARY_MODEL} returned ${response.status}. Attempting fallback model.`
      );
      return await callOpenRouterWithFallbackModel(FALLBACK_MODEL, messages, query, userLang);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Empty response from OpenRouter API");
    }

    return parseAgentResponse(rawContent, query, userLang);
  } catch (err: any) {
    console.warn("OpenRouter API call failed or timed out, using intelligent dynamic fallback:", err?.message || err);
    return getLocalKnowledgeFallback(query, userLang);
  }
}

/**
 * Secondary helper for fallback model invocation
 */
async function callOpenRouterWithFallbackModel(
  modelName: string,
  messages: any[],
  query: string,
  userLang: string
): Promise<OpenRouterAgentResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Fallback model ${modelName} returned status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("Empty fallback model content");

    return parseAgentResponse(rawContent, query, userLang);
  } catch (err) {
    console.warn("Fallback model also unavailable, switching to dynamic fallback engine");
    return getLocalKnowledgeFallback(query, userLang);
  }
}

/**
 * Cleans titles from accidental sentence wrappers, brackets or repetitive words
 */
export function cleanSuggestionTitle(rawText: string): string {
  if (!rawText) return "";
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^[•\-*]\s*/, "");
  cleaned = cleaned.replace(/^(এই\s*লিংকে\s*ক্লিক\s*করলে\s*(আপনি|তুমি)?\s*)/i, "");
  cleaned = cleaned.replace(/^(by\s*clicking\s*this\s*link,?\s*(you\s*will\s*find)?\s*)/i, "");
  cleaned = cleaned.replace(/\s*(পাবেন|পাবে|দেখতে\s*পাবেন|দেখতে\s*পাবে|নিতে\s*পারবেন|নিতে\s*পাবে|খুঁজে\s*পাবেন)\s*[।.]?$/i, "");
  cleaned = cleaned.replace(/[\[\]]/g, "");
  cleaned = cleaned.replace(/[।.]+$/, "");
  return cleaned.trim();
}

/**
 * Parses and validates structured JSON from OpenRouter,
 * combining AI explanation with dynamically tailored map filter suggestions.
 */
function parseAgentResponse(
  rawJsonString: string,
  userQuery: string,
  userLang: string
): OpenRouterAgentResponse {
  try {
    let parsed: any;
    try {
      parsed = JSON.parse(rawJsonString);
    } catch {
      const jsonMatch = rawJsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON block from AI output");
      }
    }

    const rawCategory = (parsed.category || "").toLowerCase();
    let matchedCategory = "jobs";

    if (rawCategory.includes("green") || rawCategory.includes("legal") || rawCategory.includes("law")) {
      matchedCategory = "lawyer";
    } else if (rawCategory.includes("asylum") || rawCategory.includes("tps")) {
      matchedCategory = "lawyer";
    } else if (rawCategory.includes("dmv") || rawCategory.includes("license")) {
      matchedCategory = "dmv";
    } else if (rawCategory.includes("halal") || rawCategory.includes("food") || rawCategory.includes("groc")) {
      matchedCategory = "groceries";
    } else if (rawCategory.includes("restaurant") || rawCategory.includes("cook")) {
      matchedCategory = "restaurant";
    } else if (rawCategory.includes("health") || rawCategory.includes("hospital") || rawCategory.includes("doctor")) {
      matchedCategory = "hospital";
    } else if (rawCategory.includes("hous") || rawCategory.includes("rent") || rawCategory.includes("room") || rawCategory.includes("apartment")) {
      matchedCategory = "housing";
    } else if (rawCategory.includes("mosq") || rawCategory.includes("prayer") || rawCategory.includes("masjid")) {
      matchedCategory = "mosque";
    } else if (rawCategory.includes("job") || rawCategory.includes("career") || rawCategory.includes("work")) {
      matchedCategory = "jobs";
    } else {
      const q = userQuery.toLowerCase();
      if (/green|greencard|আইন|উকিল|legal|lawyer/.test(q)) matchedCategory = "lawyer";
      else if (/asylum|আশ্রয়/.test(q)) matchedCategory = "lawyer";
      else if (/dmv|license|ড্রাইভিং/.test(q)) matchedCategory = "dmv";
      else if (/halal|খাবার|মাংস|food|বাজার/.test(q)) matchedCategory = "groceries";
      else if (/cook|restaurant|রেস্তোরাঁ|রান্না/.test(q)) matchedCategory = "restaurant";
      else if (/doctor|হাসপাতাল|health|চিকিৎসা/.test(q)) matchedCategory = "hospital";
      else if (/rent|বাসা|ভাড়া|room|sublet|apartment/.test(q)) matchedCategory = "housing";
      else if (/mosque|মসজিদ|namaz|নামাজ/.test(q)) matchedCategory = "mosque";
      else matchedCategory = "jobs";
    }

    // Extract suggestions from any key the LLM might return
    const rawSuggestions =
      parsed.suggestions ||
      parsed.custom_services ||
      parsed.service_suggestions ||
      parsed.services ||
      parsed.types ||
      [];

    let finalServiceTypes: ServiceTypeSuggestion[] = [];

    if (Array.isArray(rawSuggestions) && rawSuggestions.length > 0) {
      finalServiceTypes = rawSuggestions
        .filter((s: any) => s && (s.title || s.bnTitle))
        .map((s: any, idx: number) => {
          const rawEng = s.title || s.bnTitle || `Option ${idx + 1}`;
          const rawBng = s.bnTitle || s.title || `অপশন ${idx + 1}`;
          const engTitle = cleanSuggestionTitle(rawEng);
          const bngTitle = cleanSuggestionTitle(rawBng);
          const query = s.searchQuery || engTitle;
          const cat = s.category || matchedCategory;

          return {
            id: s.id || `dyn-srv-${idx}-${Date.now()}`,
            title: engTitle,
            bnTitle: bngTitle,
            category: cat,
            searchQuery: query,
            typeLabel: engTitle,
            bnTypeLabel: bngTitle,
            actionText: s.actionText,
            actionTextEn: s.actionTextEn,
          };
        });
    }

    // If AI failed to return suggestions, dynamically craft query-tailored suggestions!
    if (finalServiceTypes.length === 0) {
      finalServiceTypes = generateDynamicTailoredSuggestions(userQuery, matchedCategory);
    }

    const explanation =
      typeof parsed.explanation === "string" && parsed.explanation.trim().length > 15
        ? parsed.explanation.trim()
        : getLocalKnowledgeFallback(userQuery, userLang).explanation;

    const suggestionHeader =
      typeof parsed.suggestionHeader === "string" && parsed.suggestionHeader.trim().length > 0
        ? parsed.suggestionHeader.trim()
        : typeof parsed.header === "string" && parsed.header.trim().length > 0
        ? parsed.header.trim()
        : undefined;

    return {
      explanation,
      category: matchedCategory,
      suggestionHeader,
      serviceTypes: finalServiceTypes.slice(0, 5),
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn("JSON parsing failed on AI response, using dynamic fallback:", err);
    return getLocalKnowledgeFallback(userQuery, userLang);
  }
}

/**
 * Dynamically generates query-specific suggestions based on what the user asked.
 * Caters deeply to IT, Babysitting, Construction, Electrician, Plumber, Salon,
 * Cleaning, Driving, Cooking, Warehouse, Green Card, Asylum, Housing, Doctors, etc.
 * Never gives a generic fallback template for different questions!
 */
export function generateDynamicTailoredSuggestions(
  rawQuery: string,
  category: string
): ServiceTypeSuggestion[] {
  const q = rawQuery.toLowerCase();

  // 1. Babysitting, Nanny, Childcare, Caregiver, Elder care
  if (/baby|nanny|childcare|caregiver|elder|বেবিসিটিং|ন্যানি|বাচ্চা|কেয়ার/.test(q)) {
    return [
      {
        id: "dyn-babysitter-ft",
        title: "Full-Time Babysitting & Childcare jobs in NYC",
        bnTitle: "পূর্ণকালীন বেবিসিটিং ও চাইল্ডকেয়ার কাজ",
        category: "jobs",
        searchQuery: "full time babysitter nyc",
        actionText: "নিউ ইয়র্কে ফুল-টাইম বেবিসিটিং ও চাইল্ডকেয়ার কাজের সুযোগ দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore full-time babysitting and childcare opportunities in NYC, try [clicking this link].",
      },
      {
        id: "dyn-nanny-pt",
        title: "Part-Time Family Nanny positions",
        bnTitle: "অংশকালীন ফ্যামিলি ন্যানি কাজ",
        category: "jobs",
        searchQuery: "part time nanny family",
        actionText: "বাঙালি ও স্থানীয় পরিবারের পার্ট-টাইম ন্যানি পদের তালিকা সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Find part-time family nanny positions by [clicking this link].",
      },
      {
        id: "dyn-caregiver-home",
        title: "In-Home Caregiver & Companion positions",
        bnTitle: "হোম কেয়ারগিভার ও বয়োজ্যেষ্ঠদের সেবা কাজ",
        category: "jobs",
        searchQuery: "in home caregiver companion",
        actionText: "প্রবাসীদের হোম কেয়ারগিভার ও বয়োবৃদ্ধদের সেবা সংক্রান্ত কাজ তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access in-home caregiver and companion roles by [clicking this link].",
      },
      {
        id: "dyn-daycare-asst",
        title: "Community Daycare & Nursery Assistant jobs",
        bnTitle: "কমিউনিটি ডে-কেয়ার সহকারী কাজ",
        category: "jobs",
        searchQuery: "daycare assistant child care",
        actionText: "স্থানীয় ডে-কেয়ার ও চাইল্ড ডেভেলপমেন্ট সেন্টারের সহকারী কাজ আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Check out daycare and nursery assistant jobs by [clicking this link].",
      },
    ];
  }

  // 2. IT, Software, Developer, Tech, QA, Programming, Computer
  if (/it|software|tech|developer|programmer|engineer|qa|coding|কম্পিউটার|আইটি|সফটওয়্যার|ডেভেলপার/.test(q)) {
    return [
      {
        id: "dyn-sw-dev",
        title: "Software Engineer & Web Developer jobs",
        bnTitle: "সফটওয়্যার ইঞ্জিনিয়ার ও ওয়েব ডেভেলপার কাজ",
        category: "jobs",
        searchQuery: "software engineer web developer",
        actionText: "নিউ ইয়র্কে সফটওয়্যার ডেভেলপার ও টেক পদের তালিকা বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore find software engineer and web developer openings, try [clicking this link].",
      },
      {
        id: "dyn-it-support",
        title: "IT Support Specialist & Helpdesk roles",
        bnTitle: "আইটি সাপোর্ট ও হেল্পডেস্ক টেকনিশিয়ান কাজ",
        category: "jobs",
        searchQuery: "it support helpdesk technician",
        actionText: "এন্ট্রি-লেভেল আইটি সাপোর্ট ও কম্পিউটার নেটওয়ার্কিং কাজ দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find explore IT support and helpdesk positions by [clicking this link].",
      },
      {
        id: "dyn-qa-tester",
        title: "QA Software Tester & Automation positions",
        bnTitle: "কিউএ সফটওয়্যার টেস্টার পদের সুযোগ",
        category: "jobs",
        searchQuery: "qa software tester",
        actionText: "ম্যানুয়াল ও অটোমেশন সফটওয়্যার টেস্টিং কাজের সুযোগ সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Access view QA software tester opportunities by [clicking this link].",
      },
      {
        id: "dyn-tech-remote",
        title: "Remote & Immigrant-Friendly Tech roles",
        bnTitle: "রিমোট ও অভিবাসীদের জন্য আইটি চাকরির সুযোগ",
        category: "jobs",
        searchQuery: "remote tech immigrant friendly",
        actionText: "সুবিধাজনক রিমোট এবং অভিবাসী-বান্ধব টেক চাকরির তালিকা তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Discover remote tech opportunities by [clicking this link].",
      },
    ];
  }

  // 3. Electrician, Electrical Wiring, HVAC
  if (/electric|wiring|hvac|ইলেকট্রিক|বিদ্যুৎ|ইলেকট্রিশিয়ান/.test(q)) {
    return [
      {
        id: "dyn-electrician-helper",
        title: "Electrician Helper & Apprentice jobs",
        bnTitle: "ইলেকট্রিশিয়ান সহকারী ও শিক্ষানবিস কাজ",
        category: "jobs",
        searchQuery: "electrician helper apprentice",
        actionText: "ইলেকট্রিশিয়ান সহকারী ও অভিজ্ঞদের সাথে কাজের সুযোগ আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "To explore find electrician helper and apprentice jobs, try [clicking this link].",
      },
      {
        id: "dyn-osha-safety",
        title: "OSHA 30 & Site Safety Training (SST) centers",
        bnTitle: "OSHA 30 ও সাইট সেফটি ট্রেইনিং কেন্দ্র",
        category: "jobs",
        searchQuery: "osha 30 training sst",
        actionText: "কাজে বাধ্যতামূলক OSHA 30 সার্টিফিকেশন সেন্টারের সন্ধান বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find locate OSHA 30 and safety training centers by [clicking this link].",
      },
      {
        id: "dyn-hvac-tech",
        title: "HVAC Heating & Cooling Assistant roles",
        bnTitle: "HVAC হিটিং ও এসি টেকনিশিয়ান কাজ",
        category: "jobs",
        searchQuery: "hvac technician assistant",
        actionText: "রেসিডেন্সিয়াল ও কমার্শিয়াল HVAC কাজের সুযোগ দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access explore HVAC assistant and technician roles by [clicking this link].",
      },
    ];
  }

  // 4. Plumbing, Pipefitting
  if (/plumb|প্লাম্বার|প্লাম্বিং|পাইপ/.test(q)) {
    return [
      {
        id: "dyn-plumber-helper",
        title: "Plumbing Assistant & Apprentice jobs",
        bnTitle: "প্লাম্বিং সহকারী ও শিক্ষানবিস কাজ",
        category: "jobs",
        searchQuery: "plumber assistant apprentice",
        actionText: "প্লাম্বিং সহকারী ও শিক্ষানবিস পদের কাজের সুযোগ সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Check out find plumbing assistant positions by [clicking this link].",
      },
      {
        id: "dyn-residential-plumb",
        title: "Residential Pipe Maintenance & Repair work",
        bnTitle: "আবাসিক পাইপ মেইনটেন্যান্স ও মেরামত কাজ",
        category: "jobs",
        searchQuery: "pipe maintenance repair technician",
        actionText: "অ্যাপার্টমেন্ট ও বাড়ি মেরামতের প্লাম্বিং কাজ তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore discover residential plumbing roles, try [clicking this link].",
      },
    ];
  }

  // 5. Salon, Barber, Beautician, Hair, Nail
  if (/salon|barber|hair|beauty|nail|সেলুন|নাপিত|পার্লার|বিউটি/.test(q)) {
    return [
      {
        id: "dyn-barber-chair",
        title: "Barber Shop & Hair Stylist positions",
        bnTitle: "বারবার শপ ও হেয়ার স্টাইলিস্ট কাজ",
        category: "jobs",
        searchQuery: "barber shop hair stylist",
        actionText: "নিউ ইয়র্কে বারবার শপ ও সেলুনে কাজের সুযোগ আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Find explore barber shop and hair stylist openings by [clicking this link].",
      },
      {
        id: "dyn-nail-tech",
        title: "Nail Salon & Esthetician Assistant jobs",
        bnTitle: "নেইল সেলুন ও বিউটিশিয়ান সহকারী কাজ",
        category: "jobs",
        searchQuery: "nail salon technician",
        actionText: "নেইল সেলুন ও বিউটি পার্লারের কাজের সুযোগ বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access find nail salon technician roles by [clicking this link].",
      },
    ];
  }

  // 6. Cleaning, Janitorial, Housekeeping
  if (/clean|housekeep|janitor|ক্লিনিং|পরিচ্ছন্ন|ঝাড়ু/.test(q)) {
    return [
      {
        id: "dyn-office-cleaning",
        title: "Commercial Office & Building Cleaning jobs",
        bnTitle: "অফিস ও কমার্শিয়াল বিল্ডিং ক্লিনিং কাজ",
        category: "jobs",
        searchQuery: "commercial office cleaning janitor",
        actionText: "বাণিজ্যিক ভবন ও অফিস ক্লিনিং কাজের তালিকা দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Check out explore commercial office cleaning roles by [clicking this link].",
      },
      {
        id: "dyn-housekeeping",
        title: "Residential Housekeeping & Hotel Maid positions",
        bnTitle: "আবাসিক হাউসকিপিং ও হোটেল ক্লিনিং কাজ",
        category: "jobs",
        searchQuery: "residential housekeeping hotel cleaning",
        actionText: "হোটেল ও বাসা-বাড়ির হাউসকিপিং কাজের তালিকা সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "To explore find residential and hotel housekeeping jobs, try [clicking this link].",
      },
    ];
  }

  // 7. Security Guard
  if (/security|guard|সিকিউরিটি|গার্ড/.test(q)) {
    return [
      {
        id: "dyn-security-guard",
        title: "NY Security Guard License & Certified jobs",
        bnTitle: "সিকিউরিটি গার্ড লাইসেন্স ও কাজের সুযোগ",
        category: "jobs",
        searchQuery: "security guard certified ny",
        actionText: "নিউ ইয়র্কে সিকিউরিটি গার্ড পদের কাজের সুযোগ তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find view certified NY security guard jobs by [clicking this link].",
      },
      {
        id: "dyn-front-desk-concierge",
        title: "Building Front Desk & Concierge security",
        bnTitle: "বিল্ডিং ফ্রন্ট ডেস্ক ও কনসিয়ার্জ ডিউটি",
        category: "jobs",
        searchQuery: "building front desk concierge security",
        actionText: "আবাসিক ও বাণিজ্যিক ভবনে ফ্রন্ট ডেস্ক কাজের সুযোগ আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Access explore building front desk and concierge roles by [clicking this link].",
      },
    ];
  }

  // 8. Driving, Uber, Lyft, Delivery
  if (/uber|lyft|driver|delivery|courier|ড্রাইভার|ডেলিভারি|গাড়ি|উবার/.test(q)) {
    return [
      {
        id: "dyn-uber",
        title: "Uber & Lyft Rideshare Driver jobs",
        bnTitle: "Uber ও Lyft ড্রাইভার কাজ",
        category: "jobs",
        searchQuery: "uber driver",
        actionText: "Uber ও Lyft রাইডশেয়ার ড্রাইভিং কাজের সুযোগ বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Check out explore Uber and Lyft rideshare driving jobs by [clicking this link].",
      },
      {
        id: "dyn-doordash",
        title: "DoorDash & UberEats Food Delivery jobs",
        bnTitle: "DoorDash ও UberEats ফুড ডেলিভারি কাজ",
        category: "jobs",
        searchQuery: "food delivery",
        actionText: "DoorDash ও UberEats ফুড ডেলিভারি কাজের সুযোগ দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore find DoorDash and food delivery opportunities, try [clicking this link].",
      },
      {
        id: "dyn-amazon-flex",
        title: "Amazon Flex & DSP Van Delivery jobs",
        bnTitle: "Amazon Flex ডেলিভারি ভ্যান ড্রাইভার কাজ",
        category: "jobs",
        searchQuery: "delivery driver van",
        actionText: "Amazon Flex ও ভ্যান ডেলিভারি কাজের তালিকা সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Find view Amazon Flex and package delivery driver jobs by [clicking this link].",
      },
      {
        id: "dyn-tlc",
        title: "TLC Driver License & Vehicle Rental assistance",
        bnTitle: "TLC ড্রাইভিং লাইসেন্স ও গাড়ি ভাড়া সুবিধা",
        category: "dmv",
        searchQuery: "tlc license rental",
        actionText: "TLC ড্রাইভার লাইসেন্স ও সাশ্রয়ী ট্যাক্সি ভাড়ার তথ্য তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access find TLC license help and vehicle rental options by [clicking this link].",
      },
    ];
  }

  // 9. Restaurant, Cook, Kitchen, Chef, Food Service
  if (/cook|chef|kitchen|restaurant|রেস্তোরাঁ|রান্না|কিচেন|কুক/.test(q)) {
    return [
      {
        id: "dyn-cook",
        title: "Restaurant Line Cook & Prep Chef jobs",
        bnTitle: "রেস্তোরাঁ লাইন কুক ও শেফ কাজ",
        category: "jobs",
        searchQuery: "restaurant cook",
        actionText: "রেস্তোরাঁয় কুক ও শেফ পদের কাজের সুযোগ আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Check out find restaurant cook and chef positions by [clicking this link].",
      },
      {
        id: "dyn-kitchen-help",
        title: "Kitchen Helper & Dishwasher positions",
        bnTitle: "কিচেন হেল্পার ও ডিশওয়াশার কাজ",
        category: "jobs",
        searchQuery: "kitchen helper dishwasher",
        actionText: "কিচেন হেল্পার ও ডিশওয়াশার পদের সহজ কাজের সুযোগ বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore view kitchen helper and dishwasher positions, try [clicking this link].",
      },
      {
        id: "dyn-food-handler",
        title: "NYC Food Protection & Handler certification training",
        bnTitle: "NYC ফুড হ্যান্ডলার সার্টিফিকেট ট্রেনিং",
        category: "jobs",
        searchQuery: "food handler license",
        actionText: "রেস্তোরাঁ কাজের জন্য প্রয়োজনীয় ফুড হ্যান্ডলার ট্রেনিং দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find enroll in NYC food handler certification courses by [clicking this link].",
      },
      {
        id: "dyn-restaurant-cashier",
        title: "Halal Restaurant Server & Cashier jobs",
        bnTitle: "হালাল রেস্তোরাঁ সার্ভার ও ক্যাশিয়ার কাজ",
        category: "jobs",
        searchQuery: "restaurant cashier",
        actionText: "দেশি ও হালাল রেস্তোরাঁয় ক্যাশিয়ার ও সার্ভার কাজ সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Access explore restaurant cashier and server roles by [clicking this link].",
      },
    ];
  }

  // 10. Construction, Maintenance, Masonry, Labor
  if (/construct|labor|technician|কনস্ট্রাকশন|মিস্ত্রি|লেবার/.test(q)) {
    return [
      {
        id: "dyn-construction",
        title: "Construction Site Laborer jobs",
        bnTitle: "কনস্ট্রাকশন সাইট লেবার কাজ",
        category: "jobs",
        searchQuery: "construction laborer",
        actionText: "কন্সট্রাকশন সাইটে জেনারেল লেবার পদের সুযোগ তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Check out find construction laborer positions by [clicking this link].",
      },
      {
        id: "dyn-osha",
        title: "OSHA 30 & SST Safety Certification training",
        bnTitle: "OSHA 30 সেফটি সার্টিফিকেশন ট্রেনিং",
        category: "jobs",
        searchQuery: "osha 30 training",
        actionText: "অনুমোদিত OSHA 30 ট্রেইনিং সেন্টারের সন্ধান আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "To explore schedule OSHA 30 safety training, try [clicking this link].",
      },
      {
        id: "dyn-painting",
        title: "Residential Painting & Drywall Assistant jobs",
        bnTitle: "পেইন্টিং ও ড্রাইওয়াল সহকারী কাজ",
        category: "jobs",
        searchQuery: "residential painter drywall helper",
        actionText: "পেইন্টিং ও দেয়াল মেরামতের কাজের সুযোগ বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find view residential painter and drywall roles by [clicking this link].",
      },
    ];
  }

  // 11. Warehouse, Packaging, Forklift, Inventory
  if (/warehouse|packag|forklift|stock|ওয়্যারহাউস|প্যাকেজিং|স্টক/.test(q)) {
    return [
      {
        id: "dyn-wh-ecom",
        title: "Amazon & E-commerce Fulfillment Warehouse jobs",
        bnTitle: "অ্যামাজন ও ই-কমার্স ওয়্যারহাউস কাজ",
        category: "jobs",
        searchQuery: "warehouse fulfillment",
        actionText: "ই-কমার্স ও ওয়্যারহাউস ফুলফিলমেন্ট কাজের তালিকা দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access explore warehouse fulfillment openings by [clicking this link].",
      },
      {
        id: "dyn-packaging",
        title: "Packaging, Labeling & Sorting Labor jobs",
        bnTitle: "প্যাকেজিং ও সর্টিং লেবার কাজ",
        category: "jobs",
        searchQuery: "packaging sorting",
        actionText: "পণ্য প্যাকেজিং ও বাছাইকরণের সহজ কাজের সুযোগ সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Check out find packaging and sorting labor jobs by [clicking this link].",
      },
      {
        id: "dyn-forklift",
        title: "Forklift Operator Certification & jobs",
        bnTitle: "ফর্কলিফট অপারেটর কাজ ও লাইসেন্স",
        category: "jobs",
        searchQuery: "forklift operator",
        actionText: "ফর্কলিফট চালনা ও ওয়্যারহাউস পদের সুযোগ তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore access forklift operator jobs and licenses, try [clicking this link].",
      },
    ];
  }

  // 12. Green card, I-130, I-485, Adjustment of status
  if (/green\s*card|greencard|i-130|i-485|permanent|গ্রিন\s*কার্ড|গ্রিনকার্ড|পিআর/.test(q)) {
    return [
      {
        id: "dyn-family-gc",
        title: "Family Green Card (Form I-130) petition services",
        bnTitle: "পারিবারিক গ্রিন কার্ড (Form I-130) আবেদন সেবা",
        category: "lawyer",
        searchQuery: "family green card lawyer",
        actionText: "পারিবারিক গ্রিন কার্ড (Form I-130) আবেদন সহায়তা আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Find connect with family green card legal services by [clicking this link].",
      },
      {
        id: "dyn-aos-485",
        title: "Adjustment of Status (Form I-485) legal clinic",
        bnTitle: "স্ট্যাটাস এডজাস্টমেন্ট (Form I-485) আইনি সেবা",
        category: "lawyer",
        searchQuery: "adjustment of status legal aid",
        actionText: "ফর্ম I-485 স্ট্যাটাস অ্যাডজাস্টমেন্ট পরামর্শ ক্লিনিক বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access adjustment of status legal clinics by [clicking this link].",
      },
      {
        id: "dyn-ead-765",
        title: "Work Authorization (Form I-765 EAD) filing help",
        bnTitle: "ওয়ার্ক পারমিট (Form I-765 EAD) আবেদন সহায়তা",
        category: "lawyer",
        searchQuery: "work permit ead lawyer",
        actionText: "কাজের অনুমতিপত্র (EAD) আবেদন ও নবায়নের আইনজীবীদের দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Check out find work permit filing assistance by [clicking this link].",
      },
      {
        id: "dyn-probono-gc",
        title: "Free Pro-Bono Immigration Legal Aid consultations",
        bnTitle: "ফ্রি প্রো-বোনো ইমিগ্রেশন লিগ্যাল এইড পরামর্শ",
        category: "lawyer",
        searchQuery: "free immigration legal aid",
        actionText: "সম্পূর্ণ বিনামূল্যে প্রো-বোনো অভিবাসন আইনি সহায়তা সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "To explore consult free pro-bono immigration clinics, try [clicking this link].",
      },
    ];
  }

  // 13. Asylum, Deportation, Court
  if (/asylum|i-589|refugee|deportation|অ্যাসাইলাম|আশ্রয়|কোর্ট/.test(q)) {
    return [
      {
        id: "dyn-asylum-589",
        title: "Political Asylum (Form I-589) application defense",
        bnTitle: "পলিটিক্যাল অ্যাসাইলাম (Form I-589) আবেদন সেবা",
        category: "lawyer",
        searchQuery: "asylum lawyer defense",
        actionText: "রাজনৈতিক আশ্রয় আবেদনের দক্ষ আইনজীবী তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find political asylum legal defense by [clicking this link].",
      },
      {
        id: "dyn-asylum-ead",
        title: "Asylum Clock 180-Day Work Permit renewal",
        bnTitle: "অ্যাসাইলাম ক্লক ১৮০ দিনের ওয়ার্ক পারমিট নবায়ন",
        category: "lawyer",
        searchQuery: "asylum work permit renewal",
        actionText: "অ্যাসাইলাম ওয়ার্ক পারমিট ও নবায়ন সহায়তা আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Access asylum work permit renewal services by [clicking this link].",
      },
      {
        id: "dyn-court-defense",
        title: "Immigration Court & Removal Defense representation",
        bnTitle: "ইমিগ্রেশন কোর্ট ও ডিপোর্টেশন ডিফেন্স আইনজীবী",
        category: "lawyer",
        searchQuery: "immigration court defense",
        actionText: "ইমিগ্রেশন আদালতের শুনানি ও ডিফেন্স আইনজীবীদের বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Check out find immigration court defense lawyers by [clicking this link].",
      },
    ];
  }

  // 14. DMV, Driver's License, Permit
  if (/dmv|license|permit|driving|ড্রাইভিং|লাইসেন্স|পারমিট/.test(q)) {
    return [
      {
        id: "dyn-greenlight-lic",
        title: "NY Green Light Driver License application",
        bnTitle: "গ্রিন লাইট ড্রাইভার লাইসেন্স সেবা",
        category: "dmv",
        searchQuery: "green light driver license",
        actionText: "গ্রিন লাইট ড্রাইভার লাইসেন্সের ডিএমভি সেবা দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore access NY Green Light driver license locations, try [clicking this link].",
      },
      {
        id: "dyn-permit-prep",
        title: "Learner Permit Written Exam prep & booking",
        bnTitle: "লার্নার পারমিট লিখিত পরীক্ষার প্রস্তুতি ও বুকিং",
        category: "dmv",
        searchQuery: "dmv learner permit test",
        actionText: "লার্নার পারমিট পরীক্ষার প্রস্তুতি ও বুকিং সহায়তা সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Find prepare for your DMV learner permit test by [clicking this link].",
      },
      {
        id: "dyn-state-id",
        title: "Non-Driver NY State ID Card services",
        bnTitle: "নন-ড্রাইভার স্টেট আইডি কার্ড সেবা",
        category: "dmv",
        searchQuery: "non driver state id",
        actionText: "নন-ড্রাইভার স্টেট আইডি কার্ডের সরাসরি তথ্য তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access find NY State ID card services by [clicking this link].",
      },
    ];
  }

  // 15. Housing, Rent, Sublet, Apartment, Room
  if (/house|rent|apartment|room|sublet|বাসা|ভাড়া|রুম|সাবলেট|আবাসন/.test(q)) {
    return [
      {
        id: "dyn-sublet-room",
        title: "Room rentals & sublets without credit check",
        bnTitle: "নো-ক্রেডিট চেক রুম ও সাবলেট ভাড়া",
        category: "housing",
        searchQuery: "sublet room rental",
        actionText: "নো-ক্রেডিট চেক সাশ্রয়ী রুম ও সাবলেট ভাড়ার সন্ধান আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Check out find room rentals and sublets without credit check by [clicking this link].",
      },
      {
        id: "dyn-apt-listings",
        title: "1 & 2 Bedroom immigrant-friendly apartments",
        bnTitle: "১ ও ২ বেডরুম সাশ্রয়ী অ্যাপার্টমেন্ট ভাড়া",
        category: "housing",
        searchQuery: "affordable apartment rental",
        actionText: "১ ও ২ বেডরুম সাশ্রয়ী অ্যাপার্টমেন্ট ভাড়ার তালিকা বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore view affordable apartment rentals, try [clicking this link].",
      },
      {
        id: "dyn-tenant-rights",
        title: "Tenant Rights & Free Eviction Defense counseling",
        bnTitle: "ভাড়াটিয়ার আইনি সুরক্ষা ও উচ্ছেদ প্রতিরোধ সেবা",
        category: "housing",
        searchQuery: "tenant rights counseling",
        actionText: "ভাড়াটিয়াদের আইনি অধিকার ও উচ্ছেদ প্রতিরোধ সহায়তা দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find access free tenant rights counseling by [clicking this link].",
      },
    ];
  }

  // 16. Doctor, Hospital, Healthcare, Bengali Doctor
  if (/doctor|hospital|clinic|health|medical|sick|ডাক্তার|হাসপাতাল|চিকিৎসা|ওষুধ|ক্লিনিক/.test(q)) {
    return [
      {
        id: "dyn-bangla-doc",
        title: "Bangla Speaking Primary Care Doctors & Clinics",
        bnTitle: "বাংলা ভাষী প্রাইমারি ডাক্তার ও ক্লিনিক",
        category: "hospital",
        searchQuery: "bangla speaking doctor clinic",
        actionText: "বাংলা জানা অভিজ্ঞ প্রাইমারি ডাক্তারের তথ্য ও ক্লিনিক সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Access connect with Bengali-speaking primary care doctors by [clicking this link].",
      },
      {
        id: "dyn-nyccare-doc",
        title: "NYC Care low-cost dedicated primary doctor enrollment",
        bnTitle: "NYC Care স্বল্পমূল্যে প্রাইমারি ডাক্তার সেবা",
        category: "hospital",
        searchQuery: "nyc care doctor",
        actionText: "NYC Care স্বল্পমূল্যে প্রাইমারি ডাক্তার ও ওষুধ সেবা তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "Check out enroll in NYC Care low-cost healthcare by [clicking this link].",
      },
      {
        id: "dyn-free-clinic",
        title: "Community Free Health Clinics & prescription help",
        bnTitle: "বিনামূল্যে কমিউনিটি হেলথ চেকআপ ও ওষুধ সেবা",
        category: "hospital",
        searchQuery: "free community health clinic",
        actionText: "বিনামূল্যে কমিউনিটি হেলথ চেকআপ ক্লিনিকের সন্ধান আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "To explore find free community healthcare clinics, try [clicking this link].",
      },
    ];
  }

  // 17. Halal Food, Meat, Bangladeshi Grocery, Restaurant
  if (/halal|food|meat|ilish|খাবার|মাংস|ইলিশ|বাজার|রেস্তোরাঁ|রেস্টুরেন্ট/.test(q)) {
    return [
      {
        id: "dyn-halal-meat",
        title: "Zabihah Halal Meat & Poultry custom cuts",
        bnTitle: "তাজা জবিহা হালাল মাংস ও দেশি গ্রোসারি",
        category: "groceries",
        searchQuery: "halal meat grocery",
        actionText: "তাজা জবিহা হালাল মাংস ও দেশি গ্রোসারি শপের সন্ধান বিস্তারিত জানতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Find locate fresh Zabihah halal meat markets by [clicking this link].",
      },
      {
        id: "dyn-bangla-fish",
        title: "Bangladeshi Padma Ilish & imported fish markets",
        bnTitle: "পদ্মার ইলিশ ও আমদানিকৃত দেশি মাছ",
        category: "groceries",
        searchQuery: "bangladeshi grocery fish",
        actionText: "পদ্মার ইলিশ ও আমদানিকৃত বাংলাদেশি পণ্যের দোকান দেখতে [লিংকে ক্লিক] করুন।",
        actionTextEn: "Access find authentic Bangladeshi grocery stores and fresh fish by [clicking this link].",
      },
      {
        id: "dyn-halal-dining",
        title: "Authentic Halal Kacchi Biryani & dining spots",
        bnTitle: "খাঁটি হালাল কাচ্চি বিরিয়ানি ও রেস্তোরাঁ",
        category: "restaurant",
        searchQuery: "halal restaurant biryani",
        actionText: "খাঁটি হালাল বিরিয়ানি ও দেশি খাবারের রেস্তোরাঁ সন্ধান পেতে [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Discover authentic halal dining and biryani spots by [clicking this link].",
      },
    ];
  }

  // 18. Mosque, Prayer, Islamic Center
  if (/mosque|masjid|namaz|prayer|jummah|মসজিদ|নামাজ|জুম্মা/.test(q)) {
    return [
      {
        id: "dyn-mosque-5x",
        title: "Daily 5x Congregational Prayer & Jummah services",
        bnTitle: "দৈনিক ৫ ওয়াক্ত নামাজ ও জুম্মা জামাত",
        category: "mosque",
        searchQuery: "mosque prayer jummah",
        actionText: "নিকটস্থ মসজিদ ও নামাজের জামাতের সময় তথ্যের জন্য [লিংকে ক্লিক] করুন।",
        actionTextEn: "To explore view nearby mosques and prayer schedules, try [clicking this link].",
      },
      {
        id: "dyn-mosque-pantry",
        title: "Newcomer Halal Food Pantry & community support",
        bnTitle: "নতুন প্রবাসীদের সহায়তা ও হালাল ফুড প্যান্ট্রি",
        category: "mosque",
        searchQuery: "islamic community center food pantry",
        actionText: "ইসলামিক কমিউনিটি সেন্টার ও হালাল খাদ্য সহায়তা আবেদনের নির্দেশিকায় [লিংকে ক্লিক] করতে পারেন।",
        actionTextEn: "Find access newcomer community support and food pantries by [clicking this link].",
      },
    ];
  }

  // 19. Truly Dynamic Tailored Generator for Any Other Unspecified Topics!
  // Extracts the core subject from user query to prevent giving static templates!
  const cleanedSubject = rawQuery
    .replace(/^(ami|tumi|apni|amr|amader|chai|khujchi|khujtechi|lagbe|kivabe|korbo|koro|pabo|dekhao|kothay|please|help|need|want|find|looking for|searching for)\s+/gi, "")
    .replace(/\s+(er\s+kaj(\s+chai)?|er\s+chakri|er\s+job|kaj\s+chai|chakri\s+chai|er\s+sandhan|er\s+thikana|er\s+help|chai|lagbe)$/gi, "")
    .replace(/[?।!.,/\\()_+=-]/g, " ")
    .trim();

  const searchKeyword = cleanedSubject || rawQuery;

  return [
    {
      id: `dyn-custom-1-${Date.now()}`,
      title: `${searchKeyword} Verified Opportunities`,
      bnTitle: `${searchKeyword} সংক্রান্ত কাজের সুযোগ`,
      category: category || "jobs",
      searchQuery: searchKeyword,
      actionText: `এই [লিংকে ক্লিক] করলে আপনি ${searchKeyword} সংক্রান্ত যাচাইকৃত সুযোগগুলো ম্যাপে দেখতে পাবেন।`,
      actionTextEn: `By [clicking this link], you can explore verified ${searchKeyword} opportunities on the map.`,
    },
    {
      id: `dyn-custom-2-${Date.now()}`,
      title: `${searchKeyword} Community Services`,
      bnTitle: `${searchKeyword} সংক্রান্ত সরাসরি সেবা ও সহায়তা`,
      category: category || "jobs",
      searchQuery: `${searchKeyword} service`,
      actionText: `এই [লিংকে ক্লিক] করলে আপনি ${searchKeyword} সংক্রান্ত সেবা ও সহায়তা কেন্দ্রের সরাসরি লিংক পাবেন।`,
      actionTextEn: `By [clicking this link], you can find direct service providers for ${searchKeyword}.`,
    },
    {
      id: `dyn-custom-3-${Date.now()}`,
      title: `${searchKeyword} NYC & Immigrant Support`,
      bnTitle: `${searchKeyword} সহায়তাকারী প্রতিষ্ঠান`,
      category: category || "jobs",
      searchQuery: `${searchKeyword} nyc support`,
      actionText: `এই [লিংকে ক্লিক] করলে আপনি ${searchKeyword} সংক্রান্ত সহায়তাকারী সংগঠনগুলোর তালিকা পাবেন।`,
      actionTextEn: `By [clicking this link], you can connect with local immigrant support groups for ${searchKeyword}.`,
    },
  ];
}

/**
 * Built-in local fallback for offline/error situations
 */
export function getLocalKnowledgeFallback(
  rawQuery: string,
  userLang: string
): OpenRouterAgentResponse {
  const query = rawQuery.toLowerCase().trim();
  const isBangla =
    /[\u0980-\u09FF]/.test(rawQuery) ||
    userLang === "bn" ||
    /\b(ami|tumi|apni|chai|kivabe|korbo|koro|pabo|lagbe|ache|achhe|ki|kothay|dekhao|bolo)\b/i.test(rawQuery);

  let category = "jobs";
  if (/green|greencard|আইন|উকিল|legal/.test(query)) category = "lawyer";
  else if (/asylum|আশ্রয়/.test(query)) category = "lawyer";
  else if (/dmv|license|ড্রাইভিং/.test(query)) category = "dmv";
  else if (/cook|restaurant|রেস্তোরাঁ|খাবার/.test(query)) category = "restaurant";
  else if (/halal|মাংস|grocery|বাজার/.test(query)) category = "groceries";
  else if (/doctor|হাসপাতাল|health|চিকিৎসা/.test(query)) category = "hospital";
  else if (/rent|বাসা|ভাড়া|room|sublet/.test(query)) category = "housing";
  else if (/mosque|মসজিদ|namaz/.test(query)) category = "mosque";

  const dynamicSuggestions = generateDynamicTailoredSuggestions(query, category);

  // 1. Green Card
  if (/green\s*card|greencard|permanent\s*resident|i-485|i-130|গ্রিন\s*কার্ড|গ্রিনকার্ড|পিআর/.test(query)) {
    return {
      explanation: isBangla
        ? `যুক্তরাষ্ট্রে **গ্রিন কার্ড (Permanent Resident Card)** পাওয়ার প্রধান নিয়ম ও ধাপসমূহ:

**১. আবেদনের প্রধান মাধ্যমসমূহ:**
• **পারিবারিক স্পন্সরশিপ (Family):** মার্কিন নাগরিকের স্পাউস (স্বামী/স্ত্রী), ২১ বছরের কম বয়সী সন্তান বা পিতা-মাতা।
• **চাকরিভিত্তিক (Employment):** EB-1 (এক্সট্রাঅর্ডিনারি অ্যাবিলিটি), EB-2 (NIW), অথবা EB-3 স্পন্সরশিপ।
• **অ্যাসাইলাম বা শরণার্থী:** রাজনৈতিক আশ্রয় অনুমোদনের ঠিক ১ বছর পূর্ণ হলে গ্রিন কার্ডের আবেদন করা যায়।
• **ডিভি লটারি (Diversity Visa):** যোগ্য দেশের নাগরিকদের জন্য বার্ষিক অনলাইন লটারি।

**২. মূল আবেদন প্রক্রিয়া ও ধাপ:**
১. **পিটিশন দাখিল:** স্পন্সর Form I-130 বা Form I-140 ইউএসসিআইএসে দাখিল করবেন।
২. **স্ট্যাটাস অ্যাডজাস্টমেন্ট:** যুক্তরাষ্ট্রে বৈধভাবে থাকলে Form I-485 জমা দিন।
৩. **ওয়ার্ক ও ট্রাভেল পারমিট:** একই সাথে Form I-765 (EAD) ও Form I-131 জমা দিন।
৪. **বায়োমেট্রিক ও মেডিকেল:** Form I-693 মেডিকেল রিপোর্ট ও ফিঙ্গারপ্রিন্ট সম্পন্ন করুন।
৫. **ইন্টারভিউ:** লোকাল USCIS ফিল্ড অফিসে ইন্টারভিউ সফল হলে গ্রিন কার্ড ইস্যু হবে।

💡 **পরামর্শ:** যে কোনো ফর্ম জমা দেওয়ার আগে অনুমোদিত ফ্রি লিগ্যাল এইড ক্লিনিকের পরামর্শ নিন। নিচে আপনার প্রশ্নের সাথে সম্পর্কিত নির্দিষ্ট সেবার লিংক দেওয়া হলো:`
        : `Here is a complete guide on **how to get a U.S. Green Card (Permanent Residency)**:

**1. Primary Eligibility Pathways:**
• **Family-Sponsored:** Immediate relative of a U.S. citizen or lawful permanent resident.
• **Employment-Based:** EB-1, EB-2 (NIW), or EB-3 skilled worker petitions.
• **Asylum & Refugee Status:** Eligible to apply 1 year after your asylum approval date.
• **Diversity Visa (DV Lottery):** Free annual visa lottery program.

**2. Step-by-Step Application Process:**
1. **Immigrant Petition:** Sponsor submits Form I-130 (family) or Form I-140 (employment).
2. **Adjustment of Status (AOS):** File Form I-485 while lawfully inside the U.S.
3. **Work Authorization:** Submit Form I-765 (EAD) concurrently.
4. **Biometrics & Medical:** Complete Form I-693 exam and USCIS fingerprinting.
5. **Interview & Card Issuance:** Complete your USCIS field interview.

⚠️ **Crucial Advice:** Verified pro-bono immigration clinics provide free consultation. Below are tailored services matching your request:`,
      category,
      suggestionHeader: isBangla
        ? "গ্রিন কার্ড ও আইনি পরামর্শের সরাসরি লিংক:"
        : "Green Card & Legal Aid Direct Links:",
      serviceTypes: dynamicSuggestions,
      isAiGenerated: false,
    };
  }

  // 2. Jobs & Employment
  if (/job|jobs|employment|hiring|career|chackri|chari|চাকরি|কাজ|কর্মসংস্থান|নিয়োগ|ড্রাইভার|ডেলিভারি|কুক|রেস্তোরাঁ|মিস্ত্রি|baby|it|software|electric/.test(query)) {
    return {
      explanation: isBangla
        ? `অভিবাসীদের জন্য **চাকরি খোঁজা ও কর্মসংস্থান সহায়তা**:

• **ক্যারিয়ার সেন্টার ও ফ্রি ট্রেনিং:** স্টেট ডিপার্টমেন্ট অব লেবার ও কমিউনিটি সেন্টারগুলো বিনামূল্যে সিভি/রেজুমে তৈরি এবং ইন্টারভিউ প্রস্তুতিতে সাহায্য করে।
• **জনপ্রিয় সেক্টর:** আপনার কাঙ্ক্ষিত ক্ষেত্রে কাজের সুযোগসমূহ নিয়মিত আপডেট করা হয়।
• **প্রয়োজনীয় ডকুমেন্টস:** কাজের অনুমতি (EAD বা SSN), স্টেট আইডি বা ড্রাইভার লাইসেন্স এবং বেসিক রেজুমে প্রস্তুত রাখুন।

আপনার জিজ্ঞাসার সাথে সরাসরি সম্পর্কিত কাজের সুযোগের লিংক নিচে দেওয়া হলো:`
        : `Top **Immigrant Employment & Job Opportunities**:

• **Free Job Matching & Training:** State Departments of Labor and nonprofit immigrant centers provide free resume translation, OSHA certifications, and direct employer placements.
• **Requirements:** Keep your Work Authorization (EAD / SSN), State ID, and an updated resume ready.

Direct links matching your specific job interest are provided below:`,
      category,
      suggestionHeader: isBangla
        ? "আপনার পছন্দের কাজের সুযোগ ও সরাসরি লিংক:"
        : "Tailored Job Opportunities & Direct Links:",
      serviceTypes: dynamicSuggestions,
      isAiGenerated: false,
    };
  }

  // 3. Driver's License & DMV
  if (/driver|driving|license|dmv|permit|learner|green\s*light|ড্রাইভিং|লাইসেন্স|ডিএমভি/.test(query)) {
    return {
      explanation: isBangla
        ? `নিউইয়র্কে ইমিগ্রেশন স্ট্যাটাস বা SSN ছাড়াই **ড্রাইভিং লাইসেন্স** পাওয়ার নিয়ম:

**১. গ্রিন লাইট ল (Green Light Law):**
• ১৬ বছর বা তদূর্ধ্ব যেকোনো অভিবাসী সোশ্যাল সিকিউরিটি নম্বর (SSN) ছাড়াই বৈধ স্ট্যান্ডার্ড ড্রাইভার লাইসেন্স নিতে পারেন।
**২. প্রয়োজনীয় ডকুমেন্টস (৬ পয়েন্ট আইডি):**
• মূল বিদেশি পাসপোর্ট অথবা কনস্যুলার আইডি কার্ড।
• নিউইয়র্কের ঠিকানার প্রমাণ (লেটার, বিল, বা ব্যাংক স্টেটমেন্ট)।
• এসএসএন না থাকলে DMV Form NSS-1A নো-এসএসএন হলফনামা।
**৩. ডিএমভিতে করণীয় ধাপ:**
১. অনলাইনে ডিএমভিতে লার্নার পারমিট টেস্ট বুক করুন।
২. লিখিত ও দৃষ্টি পরীক্ষায় পাস করে লার্নার পারমিট নিন।
৩. ৫ ঘণ্টার প্রি-লাইসেন্সিং কোর্স ও রোড টেস্ট পাস করে লাইসেন্স গ্রহণ করুন।

আপনার প্রশ্নের সাথে প্রাসঙ্গিক লাইসেন্স ও ডিএমভি সেবার লিংক নিচে দেওয়া হলো:`
        : `How to get a **Driver's License in New York** regardless of immigration status:

**1. NY Green Light Law:**
• All residents age 16+ can apply for a standard driver's license without needing an SSN or proof of lawful immigration status.
**2. Required Identification (6 Points of ID):**
• Valid foreign passport or consular ID card.
• Proof of NY State residency (lease, utility bills, or bank statements).
• Form NSS-1A affidavit if you have never had an SSN.
**3. Steps at the DMV:**
1. Book an online permit test appointment.
2. Pass the written knowledge and vision test for your Learner Permit.
3. Complete the 5-Hour Pre-Licensing course and pass the Road Test.

Relevant driver license and DMV service links are listed below:`,
      category,
      suggestionHeader: isBangla
        ? "ড্রাইভিং লাইসেন্স ও ডিএমভি সেবার লিংক:"
        : "Driver License & DMV Service Links:",
      serviceTypes: dynamicSuggestions,
      isAiGenerated: false,
    };
  }

  // 4. Default / Fallback
  return {
    explanation: isBangla
      ? `আপনার প্রশ্নের প্রেক্ষিতে **পথসাথী স্মার্ট গাইড**:

• **প্রশ্ন বিশ্লেষণ:** "${rawQuery}" সম্পর্কিত তথ্য ও সুযোগের সন্ধান পেতে আপনি সঠিক জায়গায় এসেছেন।
• **প্রধান করণীয়:** যুক্তরাষ্ট্রের সরকারি ও কমিউনিটি সহায়তা কেন্দ্রগুলো নতুন অভিবাসীদের বিনামূল্যে পথনির্দেশনা দেয়।
• **সরাসরি সহায়তা:** কোনো প্রকার ফি ছাড়া নির্ভরযোগ্য পরামর্শ ও সেবা পাওয়ার জন্য নিচের লিংকগুলো দেখতে পারেন।

📍 আপনার অনুসন্ধানের ভিত্তিতে প্রাসঙ্গিক সুযোগ ও সেবার লিংক নিচে দেওয়া হলো:`
      : `Here is helpful guidance for your inquiry on **"${rawQuery}"**:

• **Overview:** ImmigrantConnect provides verified resources, pro-bono legal support, job opportunities, and civic guidance across New York and nationwide.
• **Key Recommendation:** Always ensure you consult certified non-profit organizations or accredited community centers.
• **Free Assistance:** You can access verified resources matching your exact request.

📍 Recommended service opportunities matching your request:`,
    category,
    suggestionHeader: isBangla
      ? "আপনার চাহিদানুযায়ী প্রাসঙ্গিক লিংক:"
      : "Relevant Recommended Direct Links:",
    serviceTypes: dynamicSuggestions,
    isAiGenerated: false,
  };
}
