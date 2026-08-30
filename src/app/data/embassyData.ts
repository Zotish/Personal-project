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
  shortName: string;
  title: string;
  banglaTitle: string;
  category: "passport" | "visa" | "attestation" | "nvr" | "dnc" | "nid" | "birth" | "poa" | "travel_pass" | "repatriation" | "camps" | "fees";
  iconName: string;
  badge: string;
  processingTimeRegular: string;
  processingTimeUrgent: string;
  feeRegular: string;
  feeUrgent: string;
  paymentMethod: string;
  submissionMode: "In-Person or Mail-in" | "Strictly In-Person (Biometrics)" | "Mail-in Preferred" | "24/7 Digital/Expedited";
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

// ─── MASTER ALL CONSULAR SERVICES DATA (ICONIZED CATALOG) ───────────────────
export const CONSULAR_SERVICES_DATA: ConsularService[] = [
  {
    id: "srv-passport",
    shortName: "Passport",
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
    summary: "Biometric e-Passport with 48/64 pages and 5 or 10-year validity for Bangladeshi citizens residing in the USA.",
    whoCanApply: "Bangladeshi citizens with a valid Smart NID or 17-digit online Birth Registration Certificate.",
    requiredDocuments: [
      "Printed Application Summary with barcode from epassport.gov.bd",
      "Original Bangladeshi Passport (MRP/Handwritten) + photocopy of info pages",
      "Original Smart NID Card or 17-digit online Digital Birth Certificate (BRIS)",
      "Valid US Legal Status proof (Green Card, Valid US Visa, EAD, or US Passport)",
      "Money Order / Bank Cashier's Check for the exact consular fee",
      "Prior appointment confirmation slip"
    ],
    stepByStepProcess: [
      "Complete online application at www.epassport.gov.bd selecting your USA mission.",
      "Download Application Summary (PDF with Barcode).",
      "Book an in-person biometric appointment at Embassy D.C., NY, LA, or Miami Consulate.",
      "Visit mission for 10-finger biometric scan, signature, and digital photo.",
      "Track status online using Application ID until passport is ready for pickup/mail."
    ],
    importantNotice: "Name, DOB, and Parents' names in e-Passport MUST match identically with your Smart NID or 17-digit Birth Certificate.",
    onlinePortalUrl: "https://www.epassport.gov.bd"
  },
  {
    id: "srv-visa",
    shortName: "Visa",
    title: "Bangladesh Visa (Tourist, Business, Student & Official)",
    banglaTitle: "বাংলাদেশ ভিসা আবেদন (ভ্রমণ, ব্যবসা ও শিক্ষার্থী)",
    category: "visa",
    iconName: "FileCheck",
    badge: "Single / Multiple Entry",
    processingTimeRegular: "7 – 10 Business Days",
    processingTimeUrgent: "3 – 5 Business Days",
    feeRegular: "$160 (US Passport Holders)",
    feeUrgent: "$260 (Expedited Service)",
    paymentMethod: "Money Order / Cashier's Check",
    submissionMode: "In-Person or Mail-in",
    summary: "Official entry visa for foreign nationals (US citizens, foreign spouses, business travelers, researchers, and tourists) visiting Bangladesh.",
    whoCanApply: "US passport holders and foreign nationals traveling to Bangladesh for tourism, business, study, work, or family visit.",
    requiredDocuments: [
      "Printed online visa application from visa.gov.bd",
      "Original US Passport valid for minimum 6 months with blank visa pages",
      "One 2x2 inch color photograph on white background",
      "Invitation letter from host/organization in Bangladesh or hotel booking & flight itinerary",
      "Money Order of $160 payable to Embassy/Consulate General",
      "Prepaid USPS Priority/Express return envelope with tracking (if by mail)"
    ],
    stepByStepProcess: [
      "Apply online at www.visa.gov.bd and print the completed form.",
      "Attach 2x2 inch photograph and sign the printed form.",
      "Enclose original passport, supporting invitation/itinerary, fee Money Order, and prepaid return envelope.",
      "Mail or submit over the counter to your jurisdictional mission.",
      "Receive passport with official machine-readable Bangladesh visa sticker."
    ],
    importantNotice: "Applicants of Bangladeshi origin or with Bangladeshi parents should apply for No Visa Required (NVR) instead of standard visa.",
    onlinePortalUrl: "https://www.visa.gov.bd"
  },
  {
    id: "srv-attestation",
    shortName: "Attestation",
    title: "Document Attestation, Police Clearance & Certificates",
    banglaTitle: "সনদ ও দলিলের সত্যায়ন (শিক্ষা, বিবাহ ও পুলিশ ক্লিয়ারেন্স)",
    category: "attestation",
    iconName: "Award",
    badge: "Official Consular Authentication",
    processingTimeRegular: "Same Day (In-Person) | 3 – 5 Days (Mail-in)",
    processingTimeUrgent: "Same Day Counter Service",
    feeRegular: "$45 per document (First copy) + $25 per additional copy",
    feeUrgent: "$80",
    paymentMethod: "Money Order / Cashier's Check",
    submissionMode: "In-Person or Mail-in",
    summary: "Consular authentication and legalization of educational certificates, birth/marriage/divorce records, commercial contracts, affidavits, and police clearances.",
    whoCanApply: "Any individual or corporate entity requiring Bangladeshi consular authentication for US or Bangladeshi documents.",
    requiredDocuments: [
      "Original document along with one set of photocopies",
      "For US Documents: Pre-notarized by US Public Notary and authenticated by State Secretary",
      "For Bangladeshi Documents: Pre-authenticated by Ministry of Foreign Affairs (MOFA), Dhaka",
      "Original Passport/NID of the applicant + valid US legal status",
      "Money Order for the exact consular fee",
      "Prepaid USPS Express return envelope with tracking (if applying by mail)"
    ],
    stepByStepProcess: [
      "Ensure the document is pre-notarized or authenticated by respective government authorities.",
      "Submit document to Embassy/Consulate in-person or by certified mail.",
      "Consular officer verifies seal integrity and affixes diplomatic authentication stamp.",
      "Document is legally valid for all administrative, judicial, and commercial uses in Bangladesh."
    ],
    importantNotice: "All US issued certificates must have State Department or Secretary of State apostille/authentication before consular endorsement."
  },
  {
    id: "srv-nvr",
    shortName: "NVR",
    title: "No Visa Required (NVR) Endorsement Seal",
    banglaTitle: "নো-ভিসা রিকোয়ার্ড (NVR) সিল ও নবায়ন",
    category: "nvr",
    iconName: "ShieldCheck",
    badge: "Lifelong / Valid with US Passport",
    processingTimeRegular: "7 – 10 Business Days",
    processingTimeUrgent: "3 – 5 Business Days",
    feeRegular: "$50 per applicant",
    feeUrgent: "$100 (Where expedited option available)",
    paymentMethod: "Money Order / Cashier's Check only",
    submissionMode: "In-Person or Mail-in",
    summary: "Permanent visa exemption sticker placed on foreign (US) passports for persons of Bangladeshi origin and their foreign-born spouses and children.",
    whoCanApply: "Bangladeshi Americans, foreign spouses, and US-born children of Bangladeshi parents.",
    requiredDocuments: [
      "Printed online visa/NVR application from visa.gov.bd",
      "Original valid US Passport (minimum 6 months validity)",
      "Proof of Bangladeshi origin (Original BD Passport, Dual Nationality Certificate, or Smart NID)",
      "For US-born Children: Child's US Birth Certificate showing parents' names + parents' BD Passports",
      "For Foreign Spouses: Certified Marriage Certificate + Spouse's proof of BD citizenship",
      "One 2x2 inch passport-size color photograph with white background",
      "Prepaid self-addressed USPS Priority / Express return envelope with tracking"
    ],
    stepByStepProcess: [
      "Complete online NVR application at www.visa.gov.bd and print the completed form.",
      "Attach 2x2 inch photograph and sign the printed form.",
      "Prepare Money Order of $50 payable to 'Consulate General of Bangladesh' or 'Embassy of Bangladesh'.",
      "If mailing: enclose US passport, proof of BD origin, fee, and prepaid return envelope.",
      "Your US passport will be returned with the official NVR endorsement sticker."
    ],
    importantNotice: "NVR is valid as long as the US passport is valid. When renewing US passport, NVR must be transferred to the new passport.",
    onlinePortalUrl: "https://www.visa.gov.bd"
  },
  {
    id: "srv-dnc",
    shortName: "DNC",
    title: "Dual Nationality Certificate (দ্বৈত নাগরিকত্ব সনদ)",
    banglaTitle: "দ্বৈত নাগরিকত্ব সনদপত্র আবেদন ও ভেরিফিকেশন",
    category: "dnc",
    iconName: "Globe",
    badge: "Constitutional Citizen Rights",
    processingTimeRegular: "60 – 90 Days (Issued by Ministry of Home Affairs, Dhaka)",
    processingTimeUrgent: "Standard Schedule",
    feeRegular: "$77 Govt Fee (Payable via Money Order)",
    feeUrgent: "N/A",
    paymentMethod: "Money Order / Cashier's Check",
    submissionMode: "In-Person or Mail-in",
    summary: "Official government recognition under the Bangladesh Citizenship Order conferring full dual citizenship rights to naturalized US citizens.",
    whoCanApply: "Bangladeshi citizens who have acquired US citizenship and wish to officially retain their Bangladeshi citizenship.",
    requiredDocuments: [
      "DNC Application Form (Form-F) in triplicate (3 copies)",
      "Original US Naturalization Certificate + 3 photocopies",
      "Valid US Passport + 3 photocopies",
      "Previous Bangladeshi Passport (MRP/Handwritten) or Smart NID or Birth Certificate",
      "4 recent passport size photographs (2x2 inch)",
      "Affidavit affirming allegiance to Bangladesh and details of properties held in Bangladesh",
      "Money Order of $77 payable to Embassy/Consulate General"
    ],
    stepByStepProcess: [
      "Fill out Form F in triplicate and attach photographs.",
      "Sign before Consular Officer or US Public Notary.",
      "Embassy forwards file to Ministry of Home Affairs (MOHA), Dhaka.",
      "Special Branch (SB) verification is conducted in Bangladesh.",
      "Official green parchment Dual Nationality Certificate is issued and delivered."
    ],
    importantNotice: "Dual Nationality Certificate entitles you to own real estate, inherit ancestral assets, and vote in Bangladesh without any legal restrictions."
  },
  {
    id: "srv-nid",
    shortName: "NID",
    title: "Smart National ID (NID) Card Registration",
    banglaTitle: "প্রবাসী ভোটার নিবন্ধন ও স্মার্ট জাতীয় পরিচয়পত্র",
    category: "nid",
    iconName: "CreditCard",
    badge: "Official Govt Smart Card",
    processingTimeRegular: "30 – 60 Days (Via Election Commission, Dhaka)",
    processingTimeUrgent: "Standard Schedule",
    feeRegular: "FREE of Charge ($0 Govt Registration)",
    feeUrgent: "N/A",
    paymentMethod: "No Fee Required",
    submissionMode: "Strictly In-Person (Biometrics)",
    summary: "Special expatriate registration for Bangladesh Smart National ID Card (NID) with 10-finger biometric scan and digital iris capture directly at USA missions.",
    whoCanApply: "Expatriate Bangladeshis residing in the USA without existing NID or requiring biometric update.",
    requiredDocuments: [
      "Online NID application form from services.nidw.gov.bd",
      "17-digit digital Birth Registration Certificate (verifiable on bdris.gov.bd)",
      "Original Bangladeshi Passport copy and US proof of residence",
      "Educational certificates (SSC / HSC / Degree) as proof of age/spelling",
      "Parents' NID copies or death certificates",
      "Citizenship certificate from Union Parishad / City Corporation in Bangladesh"
    ],
    stepByStepProcess: [
      "Register online at services.nidw.gov.bd selecting USA mission.",
      "Book an appointment for NID biometric capture at the mission.",
      "Consular team captures 10 fingerprints, iris scan, and digital photo.",
      "Data is forwarded via encrypted channel to Election Commission Headquarters in Dhaka.",
      "Upon approval, digital NID slip is generated and physical Smart Card is dispatched."
    ],
    importantNotice: "Smart NID is essential for land purchase, property transfer, opening bank accounts, and utility connections in Bangladesh.",
    onlinePortalUrl: "https://services.nidw.gov.bd"
  },
  {
    id: "srv-birth",
    shortName: "Birth Registration",
    title: "Digital Birth Registration (17-Digit BRC / BDRIS)",
    banglaTitle: "ডিজিটাল জন্ম নিবন্ধন সনদ (১৭ ডিজিটের অনলাইন সনদ)",
    category: "birth",
    iconName: "FileText",
    badge: "17-Digit Verifiable BRC",
    processingTimeRegular: "3 – 5 Business Days",
    processingTimeUrgent: "1 – 2 Business Days",
    feeRegular: "$10 – $20 (Depending on age category)",
    feeUrgent: "$30",
    paymentMethod: "Money Order / Cashier's Check",
    submissionMode: "In-Person or Mail-in",
    summary: "Official government issuance of 17-digit digital Birth Registration Certificate (BRC) in English & Bengali for children born abroad and expatriates.",
    whoCanApply: "Children of Bangladeshi parents born in the USA, and Bangladeshi expatriates requiring digital 17-digit BRC.",
    requiredDocuments: [
      "Online application summary from bdris.gov.bd",
      "For US-Born Children: Official US State Birth Certificate with parents' names",
      "Parents' original Bangladeshi Passports and Smart NID cards",
      "Parents' Marriage Certificate",
      "One recent 2x2 inch photograph",
      "Money Order payable to Embassy/Consulate General"
    ],
    stepByStepProcess: [
      "Submit online application at www.bdris.gov.bd selecting Embassy/Consulate as issuing office.",
      "Print application summary and attach supporting documents.",
      "Submit to consular counter or mail with prepaid return envelope.",
      "Consular officer registers the birth on the national BDRIS database and prints the certified 17-digit certificate."
    ],
    importantNotice: "Digital 17-digit Birth Certificate is mandatory for e-Passport applications for applicants who do not yet have a Smart NID.",
    onlinePortalUrl: "https://bdris.gov.bd"
  },
  {
    id: "srv-poa",
    shortName: "Power of Attorney",
    title: "Power of Attorney (আমমোক্তারনামা) Endorsement",
    banglaTitle: "পাওয়ার অব অ্যাটর্নি ও আমমোক্তারনামা সত্যায়ন",
    category: "poa",
    iconName: "Landmark",
    badge: "Legal Land & Asset Management",
    processingTimeRegular: "Same Day (In-Person) | 5 – 7 Days (Mail-in with Notary)",
    processingTimeUrgent: "Same Day Counter Service",
    feeRegular: "$45 per Power of Attorney document + $25 per additional copy",
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
      "Fee Money Order payable to respective Embassy/Consulate General"
    ],
    stepByStepProcess: [
      "Draft POA according to the Power of Attorney Act 2012 format with land/property schedule.",
      "Affix photographs of executants and appointed attorney with cross-signatures.",
      "Executants must appear in person before Consular Officer to sign in his/her presence.",
      "Consular Officer validates identity and seals the official Embassy legalization stamps.",
      "After receiving the attested document, send it to Bangladesh to be stamped by the Ministry of Foreign Affairs (MOFA), Dhaka, and registered at the local Sub-Registry Office."
    ],
    importantNotice: "Executants must sign BEFORE the Consular Officer. Do NOT sign beforehand unless following the multi-step State Secretary & Notary legalization route."
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
    service.shortName.toLowerCase().includes(q) ||
    service.title.toLowerCase().includes(q) ||
    service.banglaTitle.toLowerCase().includes(q) ||
    service.summary.toLowerCase().includes(q) ||
    service.badge.toLowerCase().includes(q) ||
    service.requiredDocuments.some(d => d.toLowerCase().includes(q))
  );
}
