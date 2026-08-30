export interface ConsularMission {
  id: string;
  name: string;
  type: "Embassy" | "Consulate General" | "Honorary Consulate";
  city: string;
  state: string;
  address: string;
  lat: number;
  lng: number;
  distance?: string;
  distanceKm?: number;
  jurisdiction: string[];
  headOfMission: string;
  phone: string;
  emergencyHotline: string;
  email: string;
  website: string;
  hours: string;
  image: string;
}

export interface ConsularService {
  id: string;
  title: string;
  banglaTitle: string;
  category: "passport" | "nvr" | "poa" | "nid" | "travel_pass" | "emergency" | "camps";
  iconName: string;
  badge: string;
  processingTimeRegular: string;
  processingTimeUrgent: string;
  feeRegular: string;
  feeUrgent: string;
  paymentMethod: string;
  submissionMode: "In-Person or Mail-in" | "Strictly In-Person (Biometrics)" | "Mail-in Preferred";
  summary: string;
  whoCanApply: string;
  requiredDocuments: string[];
  stepByStepProcess: string[];
  importantNotice: string;
  officialFormUrl?: string;
  onlinePortalUrl?: string;
}

export interface ConsularCamp {
  id: string;
  city: string;
  state: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  organizingMission: string;
  servicesProvided: string[];
  registrationRequired: boolean;
  contactNumber: string;
}

// ─── OFFICIAL DIPLOMATIC MISSIONS IN THE USA ────────────────────────────────
export const BD_DIPLOMATIC_MISSIONS: ConsularMission[] = [
  {
    id: "mission-dc",
    name: "Embassy of Bangladesh, Washington, D.C.",
    type: "Embassy",
    city: "Washington",
    state: "D.C.",
    address: "3510 International Drive NW, Washington, DC 20008",
    lat: 38.9395,
    lng: -77.0658,
    jurisdiction: [
      "Washington D.C.", "Virginia", "Maryland", "North Carolina", "South Carolina",
      "Georgia", "Florida", "Alabama", "Tennessee", "West Virginia", "Kentucky",
      "Mississippi", "Louisiana", "Arkansas"
    ],
    headOfMission: "Ambassador of Bangladesh to the USA",
    phone: "+1 (202) 244-0183",
    emergencyHotline: "+1 (202) 740-6305",
    email: "pvwing.washdc@mofa.gov.bd",
    website: "https://bdembassyusa.org",
    hours: "Mon – Fri: 9:30 AM – 5:00 PM (Receiving: 10:00 AM – 1:00 PM)",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "mission-ny",
    name: "Consulate General of Bangladesh, New York",
    type: "Consulate General",
    city: "New York",
    state: "NY",
    address: "34-18 Northern Blvd, Long Island City, NY 11101",
    lat: 40.7518,
    lng: -73.9317,
    jurisdiction: [
      "New York", "New Jersey", "Connecticut", "Pennsylvania", "Massachusetts",
      "Rhode Island", "New Hampshire", "Vermont", "Maine"
    ],
    headOfMission: "Consul General of Bangladesh, NY",
    phone: "+1 (212) 599-6767",
    emergencyHotline: "+1 (646) 645-7242",
    email: "contact@bdcgny.org",
    website: "https://www.bdcgny.org",
    hours: "Mon – Fri: 9:00 AM – 5:00 PM (Delivery: 3:00 PM – 4:30 PM)",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "mission-la",
    name: "Consulate General of Bangladesh, Los Angeles",
    type: "Consulate General",
    city: "Los Angeles",
    state: "CA",
    address: "501 S Fairfax Ave, Los Angeles, CA 90036",
    lat: 34.0664,
    lng: -118.3615,
    jurisdiction: [
      "California", "Washington", "Oregon", "Nevada", "Arizona", "Utah",
      "Idaho", "Montana", "Wyoming", "Colorado", "New Mexico", "Alaska", "Hawaii"
    ],
    headOfMission: "Consul General of Bangladesh, LA",
    phone: "+1 (323) 932-0100",
    emergencyHotline: "+1 (213) 448-4333",
    email: "bcgla02@gmail.com",
    website: "https://bangladeshconsulatela.org",
    hours: "Mon – Fri: 9:30 AM – 5:00 PM",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "mission-miami",
    name: "Consulate General of Bangladesh, Miami",
    type: "Consulate General",
    city: "Miami",
    state: "FL",
    address: "100 N Biscayne Blvd, Suite 2109, Miami, FL 33132",
    lat: 25.7753,
    lng: -80.1895,
    jurisdiction: ["Florida", "Georgia", "Alabama", "Puerto Rico", "US Virgin Islands"],
    headOfMission: "Consul General of Bangladesh, Miami",
    phone: "+1 (305) 379-6611",
    emergencyHotline: "+1 (786) 660-8433",
    email: "mission.miami@mofa.gov.bd",
    website: "https://miami.mofa.gov.bd",
    hours: "Mon – Fri: 9:30 AM – 4:30 PM",
    image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&auto=format&fit=crop&q=80"
  }
];

// ─── COMPREHENSIVE CONSULAR SERVICES DATA ───────────────────────────────────
export const CONSULAR_SERVICES_DATA: ConsularService[] = [
  {
    id: "srv-epassport",
    title: "E-Passport (Electronic Passport) Application & Renewal",
    banglaTitle: "ই-পাসপোর্ট আবেদন ও নবায়ন (বায়োমেট্রিক)",
    category: "passport",
    iconName: "BookOpen",
    badge: "10-Year Validity",
    processingTimeRegular: "30 – 45 Business Days",
    processingTimeUrgent: "15 – 20 Business Days",
    feeRegular: "$110 (48 Pages / 5 Yrs) | $165 (48 Pages / 10 Yrs)",
    feeUrgent: "$165 (48 Pages / 5 Yrs) | $220 (48 Pages / 10 Yrs)",
    paymentMethod: "Money Order / Cashier's Check payable to Embassy/Consulate",
    submissionMode: "Strictly In-Person (Biometrics)",
    summary: "State-of-the-art biometric e-Passport for Bangladeshi citizens living in the USA with 48/64 pages and 5 or 10-year validity.",
    whoCanApply: "Any Bangladeshi citizen possessing a valid Bangladeshi Smart NID card or 17-digit Digital Birth Registration Certificate (BRIS).",
    requiredDocuments: [
      "Printed Application Summary with barcode from epassport.gov.bd",
      "Original Bangladeshi Passport (MRP/Handwritten) along with photocopy of info pages",
      "Original Bangladeshi Smart NID Card or 17-digit verifiable Digital Birth Certificate (BRIS)",
      "Valid US Legal Status proof (Green Card, Valid US Visa, Work Permit / EAD, or US Passport)",
      "Money Order / Bank Cashier's Check for the exact consular fee",
      "Prior appointment confirmation slip from the mission portal"
    ],
    stepByStepProcess: [
      "Fill out online application form at www.epassport.gov.bd selecting your respective USA mission.",
      "Submit online and download the Application Summary (PDF with Barcode).",
      "Book an in-person biometric appointment at Embassy D.C., NY, LA, or Miami Consulate.",
      "Visit the mission with original documents, physical photos are not required (captured on-site).",
      "Provide 10-finger biometric scan, digital signature, and facial photograph.",
      "Track your status online using your Application ID until passport is ready for pickup or mail return."
    ],
    importantNotice: "Name, Date of Birth, and Father/Mother's name in the e-Passport application MUST match identically with your Smart NID or 17-digit online Birth Registration Certificate.",
    onlinePortalUrl: "https://www.epassport.gov.bd"
  },
  {
    id: "srv-nvr",
    title: "No Visa Required (NVR) Endorsement",
    banglaTitle: "নো-ভিসা রিকোয়ার্ড (NVR) সিল ও নবায়ন",
    category: "nvr",
    iconName: "ShieldCheck",
    badge: "Lifelong / Valid with US Passport",
    processingTimeRegular: "7 – 10 Business Days",
    processingTimeUrgent: "3 – 5 Business Days",
    feeRegular: "$50 per applicant",
    feeUrgent: "$100 (Where expedited option available)",
    paymentMethod: "Money Order / Cashier's Check only (No Cash/Card)",
    submissionMode: "In-Person or Mail-in",
    summary: "Permanent visa exemption sticker placed on foreign (US) passports for persons of Bangladeshi origin and their foreign-born spouses and children.",
    whoCanApply: "Bangladeshi Americans, their non-Bangladeshi spouses, and US-born children of Bangladeshi parents.",
    requiredDocuments: [
      "Printed online visa/NVR application confirmation from visa.gov.bd",
      "Original valid US Passport (minimum 6 months validity with blank visa pages)",
      "Proof of Bangladeshi origin (Original BD Passport, Dual Nationality Certificate, or Smart NID)",
      "For US-born Children: Child's US Birth Certificate showing parents' names + parents' BD Passports",
      "For Foreign Spouses: Certified Marriage Certificate + Spouse's proof of BD citizenship",
      "One recent 2x2 inch passport-size color photograph with white background",
      "Prepaid self-addressed USPS Priority / Express return envelope with tracking number (if applying by mail)"
    ],
    stepByStepProcess: [
      "Complete online NVR application at www.visa.gov.bd and print the completed form with barcode.",
      "Attach 2x2 inch photograph and sign the printed form.",
      "Prepare Money Order of $50 payable to 'Consulate General of Bangladesh' or 'Embassy of Bangladesh'.",
      "If mailing: enclose US passport, proof of BD origin, fee, and prepaid return envelope.",
      "Send via USPS Certified / Express mail to your jurisdiction's consular mission.",
      "Your US passport will be returned with the official NVR endorsement sticker."
    ],
    importantNotice: "NVR is valid as long as the US passport is valid. When renewing US passport, NVR must be transferred to the new passport.",
    onlinePortalUrl: "https://www.visa.gov.bd"
  },
  {
    id: "srv-poa",
    title: "Power of Attorney (আমমোক্তারনামা) Endorsement & Legalization",
    banglaTitle: "পাওয়ার অব অ্যাটর্নি ও দলিলের সত্যায়ন",
    category: "poa",
    iconName: "FileText",
    badge: "Legal Land & Asset Management",
    processingTimeRegular: "Same Day (In-Person) | 5 – 7 Days (Mail-in with Notary)",
    processingTimeUrgent: "Same Day Counter Service",
    feeRegular: "$45 per Power of Attorney document (First copy) + $25 per additional copy",
    feeUrgent: "$80",
    paymentMethod: "Money Order / Cashier's Check",
    submissionMode: "In-Person or Mail-in",
    summary: "Legal execution of Power of Attorney conferring authority to relatives/agents in Bangladesh to manage, sell, or partition property, bank accounts, and legal matters.",
    whoCanApply: "Expatriate Bangladeshis or foreign citizens owning property, land, or business interests in Bangladesh.",
    requiredDocuments: [
      "Unsigned Power of Attorney document prepared on legal parchment in specified Bangladeshi legal format",
      "Two recent passport-size photos of each Principal (Executant) and Attorney (Agent)",
      "Original Bangladeshi Passport or US Passport with NVR of all Executants",
      "Proof of property ownership (Khatian, Parcha, Deed / Dalil copy, Mutation / Namjari)",
      "If by Mail: Document must be pre-notarized by US Public Notary and authenticated by State Dept",
      "Fee Money Order payable to the respective Embassy/Consulate General"
    ],
    stepByStepProcess: [
      "Draft POA according to the Power of Attorney Act 2012 format with land/property schedule.",
      "Affix photographs of executants and appointed attorney with cross-signatures.",
      "Executants must appear in person before the Consular Officer to sign in his/her presence.",
      "Consular Officer validates identity and seals the official Embassy legalization stamps.",
      "After receiving the attested document, send it to Bangladesh to be stamped by the Ministry of Foreign Affairs (MOFA), Dhaka, and registered at the local Sub-Registry Office."
    ],
    importantNotice: "Executants must sign BEFORE the Consular Officer. Do NOT sign beforehand unless following the multi-step State Secretary & Notary legalization route."
  },
  {
    id: "srv-nid-birth",
    title: "Smart NID Enrollment & Digital Birth Certificate",
    banglaTitle: "স্মার্ট জাতীয় পরিচয়পত্র ও ডিজিটাল জন্ম নিবন্ধন",
    category: "nid",
    iconName: "CreditCard",
    badge: "Official Govt Identity",
    processingTimeRegular: "30 – 60 Days (Processed via Election Commission, Dhaka)",
    processingTimeUrgent: "Standard Schedule",
    feeRegular: "NID Registration: Free | Birth Certificate: $10 – $20",
    feeUrgent: "N/A",
    paymentMethod: "Money Order / Online BRC Gateway",
    submissionMode: "Strictly In-Person (Biometrics)",
    summary: "Special expatriate registration for Bangladesh Smart National ID Card (NID) and 17-digit digital Birth Registration Certificate directly from USA missions.",
    whoCanApply: "Expatriate Bangladeshis without existing NID or whose NID requires biometric update / correction.",
    requiredDocuments: [
      "Online NID application form from services.nidw.gov.bd",
      "Digital 17-digit Birth Registration Certificate (verifiable on bdris.gov.bd)",
      "Original Bangladeshi Passport copy and US proof of residence",
      "Educational certificates (SSC / HSC / Degree) as proof of age/spelling",
      "Parents' NID copies or death certificates",
      "Citizenship certificate from Union Parishad / City Corporation Councilor in Bangladesh"
    ],
    stepByStepProcess: [
      "Register online at services.nidw.gov.bd selecting Embassy/Consulate as your submission center.",
      "Book an appointment for NID biometric capture at the mission.",
      "Consular team captures 10 fingerprints, iris scan, and digital photo.",
      "Data is forwarded via encrypted channel to Election Commission Headquarters in Dhaka.",
      "Upon approval, digital NID card slip is generated and physical Smart Card is dispatched."
    ],
    importantNotice: "Smart NID is essential for land purchase, property transfer, opening bank accounts, and utility connections in Bangladesh."
  },
  {
    id: "srv-travel-pass",
    title: "Emergency Travel Permit (One-Way Travel Pass)",
    banglaTitle: "জরুরি ট্রাভেল পারমিট (জরুরি দেশে প্রত্যাবর্তনের জন্য)",
    category: "travel_pass",
    iconName: "Plane",
    badge: "Emergency 24-48 Hours",
    processingTimeRegular: "24 – 48 Hours",
    processingTimeUrgent: "Same Day Emergency",
    feeRegular: "$25 (Valid for 3 months, single journey)",
    feeUrgent: "$50",
    paymentMethod: "Money Order / Cashier's Check",
    submissionMode: "In-Person or Mail-in",
    summary: "Issued to Bangladeshi nationals who have lost their passport, have expired passports, or need emergency one-way travel back to Bangladesh.",
    whoCanApply: "Bangladeshi citizens stranded in the USA without a valid passport requiring immediate repatriation.",
    requiredDocuments: [
      "Completed Travel Permit application form",
      "Copy of lost/expired Bangladeshi passport or digital birth certificate or NID",
      "Police Report (if passport was lost or stolen in the USA)",
      "3 passport-size color photographs (2x2 inch)",
      "Proof of confirmed airline ticket reservation to Bangladesh",
      "Money Order of $25 payable to Embassy/Consulate"
    ],
    stepByStepProcess: [
      "Fill out the Emergency Travel Permit application.",
      "Present proof of Bangladeshi nationality to the consular officer.",
      "Consular officer verifies nationality and issues the white Travel Permit book.",
      "Permit is valid for 3 months and allows a single one-way trip to Bangladesh."
    ],
    importantNotice: "Travel Permit is strictly for ONE-WAY travel to Bangladesh. You cannot travel to third countries on this document."
  },
  {
    id: "srv-repatriation",
    title: "Repatriation of Mortal Remains & Death NOC",
    banglaTitle: "মরদেহ দেশে প্রেরণ ও অনাপত্তি সনদ (NOC)",
    category: "emergency",
    iconName: "Heart",
    badge: "24/7 Priority Emergency Service",
    processingTimeRegular: "Within 2 – 4 Hours (Free of Charge)",
    processingTimeUrgent: "Immediate 24/7 Hotline",
    feeRegular: "FREE of Charge ($0 Govt Fee)",
    feeUrgent: "FREE ($0)",
    paymentMethod: "No Fee Required",
    submissionMode: "In-Person or Digital Expedited Submission",
    summary: "Immediate issuance of No Objection Certificate (NOC) and consular clearance for transporting deceased Bangladeshi nationals back to Bangladesh for burial.",
    whoCanApply: "Immediate family members, designated funeral homes, or community representatives.",
    requiredDocuments: [
      "Original Bangladeshi Passport of the deceased",
      "Official US Certified Death Certificate (showing cause of death)",
      "Embalming & Non-Contagious Disease Certificate from licensed funeral home",
      "Transit Permit issued by local Department of Health / Vital Statistics",
      "Flight itinerary and airway bill (cargo booking details)",
      "Contact information of receiver/family in Bangladesh"
    ],
    stepByStepProcess: [
      "Contact the Embassy/Consulate 24/7 Citizen Emergency Hotline immediately.",
      "Funeral home emails digital copies of death certificate, embalming cert, and transit permit.",
      "Consular officer issues official Death Registration & Transport NOC within hours.",
      "Consulate coordinates with airline cargo handlers and Hazrat Shahjalal International Airport (DAC) expatriate welfare desk for expedited clearance and financial grant."
    ],
    importantNotice: "Wage Earners' Welfare Board (WEWB) provides BDT 35,000 instant burial grant and BDT 3,00,000 financial compensation for eligible deceased migrant workers."
  }
];

// ─── UPCOMING CONSULAR OUTREACH CAMPS IN VARIOUS US CITIES ──────────────────
export const CONSULAR_OUTREACH_CAMPS: ConsularCamp[] = [
  {
    id: "camp-1",
    city: "Dallas / Fort Worth",
    state: "Texas",
    venue: "Irving Bangladesh Community Center",
    address: "2425 Story Rd, Irving, TX 75038",
    date: "September 19 – 20, 2026",
    time: "9:30 AM – 4:30 PM",
    organizingMission: "Embassy of Bangladesh, Washington, D.C.",
    servicesProvided: ["E-Passport Biometrics", "NVR Endorsement", "Power of Attorney", "Birth Registration"],
    registrationRequired: true,
    contactNumber: "+1 (202) 244-0183 Ext 115"
  },
  {
    id: "camp-2",
    city: "Detroit / Hamtramck",
    state: "Michigan",
    venue: "Hamtramck High School Community Hall",
    address: "11410 Charest St, Hamtramck, MI 48212",
    date: "October 10 – 11, 2026",
    time: "10:00 AM – 5:00 PM",
    organizingMission: "Embassy of Bangladesh, Washington, D.C.",
    servicesProvided: ["E-Passport Biometrics", "NVR Endorsement", "Smart NID Registration", "Document Attestation"],
    registrationRequired: true,
    contactNumber: "+1 (202) 740-6305"
  },
  {
    id: "camp-3",
    city: "Philadelphia",
    state: "Pennsylvania",
    venue: "Upper Darby Cultural Center",
    address: "7000 Garrett Rd, Upper Darby, PA 19082",
    date: "October 24 – 25, 2026",
    time: "9:00 AM – 4:00 PM",
    organizingMission: "Consulate General of Bangladesh, New York",
    servicesProvided: ["E-Passport Biometrics", "NVR", "Power of Attorney", "Travel Permit"],
    registrationRequired: true,
    contactNumber: "+1 (212) 599-6767"
  },
  {
    id: "camp-4",
    city: "Atlanta",
    state: "Georgia",
    venue: "Lilburn Community Center",
    address: "761 Main St NW, Lilburn, GA 30047",
    date: "November 14 – 15, 2026",
    time: "9:30 AM – 4:30 PM",
    organizingMission: "Embassy of Bangladesh, Washington, D.C.",
    servicesProvided: ["E-Passport Biometrics", "NVR", "Dual Nationality", "Legal Attestation"],
    registrationRequired: true,
    contactNumber: "+1 (202) 244-0183"
  }
];

// Helper to filter consular services
export function matchConsularQuery(service: ConsularService, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    service.title.toLowerCase().includes(q) ||
    service.banglaTitle.toLowerCase().includes(q) ||
    service.summary.toLowerCase().includes(q) ||
    service.badge.toLowerCase().includes(q) ||
    service.requiredDocuments.some(d => d.toLowerCase().includes(q))
  );
}
