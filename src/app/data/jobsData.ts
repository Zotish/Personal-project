// ─── Shared Jobs Data & Generator ──────────────────────────────────────────

export type LiveJobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string;
  salary: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  category: string;
  distance: string;
  distanceKm: number;
  isNearby: boolean;
  lat: number;
  lng: number;
  logo: string;
  image: string;
  posted: string;
  description: string;
  skills: string[];
  experience: string;
  contactPhone: string;
  contactEmail: string;
  spots: number;
  responsibilities: string[];
  qualifications: string[];
  whatWeOffer: string[];
  applyUrl: string;
  deadline?: string;
  workplaceType?: string;
};

// ─── Distance Helpers ───────────────────────────────────────────────────────

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m away`;
  }
  return `${distKm.toFixed(1)} km away`;
}

// ─── Job Query Detection ────────────────────────────────────────────────────

const JOB_KEYWORDS = [
  "job", "jobs", "hiring", "hire", "work", "career", "vacancy", "vacancies",
  "developer", "engineer", "software", "frontend", "backend", "fullstack",
  "chef", "cook", "kitchen", "restaurant job", "hotel job",
  "rider", "delivery", "courier", "driver",
  "pharmacist", "chemist", "pharmacy", "medical job",
  "sales", "retail", "showroom", "executive",
  "designer", "ui/ux", "graphic", "figma",
  "supervisor", "warehouse", "operations", "logistics",
  "marketing", "digital marketing", "seo", "content",
  "technician", "electrician", "maintenance", "electrical",
  "qa", "tester", "quality assurance",
  "support", "bpo", "call center", "customer care",
  "accountant", "accounting", "finance", "accounts",
  "full-time", "part-time", "remote", "hybrid", "internship", "chakri", "kormosongsthan"
];

export function isJobQuery(query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase().trim();
  return JOB_KEYWORDS.some(k => q.includes(k));
}

// ─── Dynamic Live Location Jobs Generator ───────────────────────────────────

export function generateLiveLocationJobs(lat: number, lng: number, areaName: string, cityName: string): LiveJobListing[] {
  const area = areaName || "Near You";
  const city = cityName || "Local Area";

  const templateList = [
    {
      title: "Senior Frontend Developer (React / Next.js)",
      company: "TechHive Digital Labs",
      category: "IT & Software",
      salary: "৳65,000 – ৳95,000/mo",
      type: "Full-time",
      tags: ["React", "TypeScript", "Tailwind", "Next.js"],
      dLat: 0.0028,
      dLng: 0.0032,
      logo: "💻",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
      exp: "2+ yrs experience",
      desc: "Developing responsive web applications and interactive UI dashboards. Flexible working hours, health coverage & yearly festival bonuses.",
      deadline: "30 Oct 2026",
      workplaceType: "Hybrid (2 Days WFH)",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=techhive-senior-frontend",
      responsibilities: [
        "Architect, build, and maintain responsive web applications and interactive dashboards using React and Next.js.",
        "Collaborate closely with UI/UX designers and backend engineers to integrate RESTful and GraphQL APIs seamlessly.",
        "Optimize web application performance, Core Web Vitals, and ensure smooth cross-browser responsiveness.",
        "Write clean, modular, and maintainable TypeScript code with comprehensive unit and integration testing.",
        "Participate in agile sprint rituals, peer code reviews, and architectural design discussions."
      ],
      qualifications: [
        "2+ years of hands-on professional software engineering experience with React, Next.js, and TypeScript.",
        "Deep understanding of modern state management, CSS frameworks (Tailwind CSS), and responsive design principles.",
        "Familiarity with RESTful APIs, Git version control, CI/CD workflows, and performance profiling tools.",
        "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical industry experience.",
        "Strong problem-solving mindset, attention to detail, and effective team communication skills."
      ],
      whatWeOffer: [
        "Attractive monthly salary (৳65,000 – ৳95,000) with bi-annual performance evaluations.",
        "2 Yearly Festival Bonuses + Performance-based project completion incentives.",
        "Comprehensive Health and Medical Insurance coverage for employee and immediate family.",
        "Flexible working hours with hybrid work flexibility (2 days work-from-home per week).",
        "Subsidized daily gourmet lunch, unlimited coffee/snacks, and sponsored team retreats."
      ]
    },
    {
      title: "Executive Chef & Kitchen Supervisor",
      company: "Heritage Dine & Lounge",
      category: "Hospitality",
      salary: "৳35,000 – ৳48,000/mo",
      type: "Full-time",
      tags: ["Culinary", "Kitchen Prep", "Meals Included"],
      dLat: -0.0022,
      dLng: 0.0025,
      logo: "🍽️",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
      exp: "1+ yrs experience",
      desc: "Overseeing menu preparation, culinary hygiene and kitchen staff management. Daily meals & attendance bonus provided.",
      deadline: "15 Oct 2026",
      workplaceType: "On-site Showroom & Lounge",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=heritage-executive-chef",
      responsibilities: [
        "Oversee daily kitchen operations, food preparation, quality standards, and culinary presentation.",
        "Supervise kitchen staff, assign station duties, and enforce strict food safety and hygiene protocols.",
        "Plan seasonal menu offerings, control food waste, and coordinate inventory restocking with suppliers.",
        "Maintain consistent portion sizes, cooking temperature standards, and recipe compliance."
      ],
      qualifications: [
        "1+ years of culinary experience in high-volume dining, hotel, or lounge kitchens.",
        "Vocational diploma in Culinary Arts, Hospitality Management, or equivalent food handling certification.",
        "Strong team leadership, time management, and multitasking ability in fast-paced environments.",
        "In-depth knowledge of international and contemporary fusion cuisines."
      ],
      whatWeOffer: [
        "Attractive salary package (৳35,000 – ৳48,000/mo) with daily attendance bonus.",
        "Complimentary daily chef meals, snacks, and beverage perks during shifts.",
        "Overtime compensation, festival bonuses, and tip-sharing benefits.",
        "Health and accidental insurance support with career advancement opportunities."
      ]
    },
    {
      title: "Accounts & Financial Officer",
      company: "Apex Business Solutions",
      category: "Finance",
      salary: "৳40,000 – ৳55,000/mo",
      type: "Full-time",
      tags: ["Tally", "QuickBooks", "Taxation"],
      dLat: 0.0038,
      dLng: -0.0029,
      logo: "📊",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      exp: "Graduate in BBA/Accounting",
      desc: "Handling ledger entries, invoice reconciliation and monthly payroll processing. Proactive team environment.",
      deadline: "25 Oct 2026",
      workplaceType: "Corporate Office (On-site)",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=apex-accounts-officer",
      responsibilities: [
        "Maintain daily bookkeeping, ledger entries, bank reconciliations, and cash flow records.",
        "Process monthly payroll, employee reimbursements, and statutory tax/VAT deductions.",
        "Prepare financial statements, balance sheets, and quarterly budget audit reports for management.",
        "Coordinate with external auditors, banks, and tax authorities to ensure regulatory compliance."
      ],
      qualifications: [
        "BBA / Master’s in Accounting, Finance, or semi-qualified CA / CMA / ACCA.",
        "Proven hands-on proficiency with Tally ERP 9, QuickBooks, and advanced Microsoft Excel.",
        "1-2 years of relevant accounting and financial reporting experience.",
        "High accuracy, numerical aptitude, confidentiality, and attention to detail."
      ],
      whatWeOffer: [
        "Monthly salary of ৳40,000 – ৳55,000 with annual salary increment reviews.",
        "2 Festival Bonuses, Provident Fund (PF), and Gratuity benefits.",
        "Professional development sponsorship and certification support.",
        "5-day work week (Friday & Saturday off) in an air-conditioned corporate environment."
      ]
    },
    {
      title: "Express Delivery Rider (Bike/Cycle)",
      company: "QuickDrop Courier Express",
      category: "Logistics",
      salary: "৳22,000 – ৳32,000/mo",
      type: "Full-time",
      tags: ["Flexible Shifts", "Daily Fuel Bonus"],
      dLat: -0.0034,
      dLng: -0.0019,
      logo: "🛵",
      image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80",
      exp: "Own bike / Smartphone",
      desc: "Parcel and document delivery within nearby zones. Guaranteed weekly payment + delivery commission incentives.",
      deadline: "Open / Urgent Hiring",
      workplaceType: "Field / On-road Delivery",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=quickdrop-delivery-rider",
      responsibilities: [
        "Safely deliver customer packages, documents, and parcels across assigned geographic zones.",
        "Verify customer delivery addresses and obtain digital OTP confirmations or signatures upon handover.",
        "Handle cash-on-delivery (COD) collections accurately and deposit balances daily.",
        "Maintain delivery vehicle safety, ride responsibly, and adhere to traffic regulations."
      ],
      qualifications: [
        "Valid Driving License and own motorcycle/bicycle with digital smartphone (Android/iOS).",
        "Minimum SSC / Class 10 educational qualification.",
        "Good knowledge of local roads, landmarks, and navigation apps.",
        "Punctual, polite customer demeanor, and honest work ethic."
      ],
      whatWeOffer: [
        "Guaranteed monthly base earnings (৳22,000 – ৳32,000) + generous per-delivery commissions.",
        "Daily fuel and mobile data allowance bonus.",
        "Comprehensive motorcycle accidental insurance coverage provided.",
        "Flexible shift choices (Day / Evening / Weekend shifts)."
      ]
    },
    {
      title: "Registered Pharmacist / Chemist",
      company: "CarePlus Pharmacy & Wellness",
      category: "Healthcare",
      salary: "৳32,000 – ৳45,000/mo",
      type: "Full-time",
      tags: ["B.Pharm / Diploma", "Medicine Dispensing"],
      dLat: 0.0014,
      dLng: -0.0038,
      logo: "💊",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
      exp: "Diploma in Pharmacy",
      desc: "Dispensing OTC and prescription medicines, patient counseling and inventory control in a modern pharmacy setup.",
      deadline: "20 Oct 2026",
      workplaceType: "Retail Pharmacy Store",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=careplus-pharmacist",
      responsibilities: [
        "Dispense prescription and over-the-counter (OTC) medicines accurately following drug regulations.",
        "Counsel patients on proper dosage, administration instructions, and potential side effects.",
        "Manage medicine inventory, monitor expiry dates, and place replenishment orders.",
        "Maintain cleanliness, temperature-controlled storage, and digital billing records."
      ],
      qualifications: [
        "Diploma or Bachelor in Pharmacy (B.Pharm) with valid Pharmacy Council registration (Grade A or B).",
        "1+ years experience in retail pharmacy, hospital dispensary, or health center.",
        "Sound knowledge of generic drug names, therapeutic classes, and dosage forms.",
        "Customer-friendly communication and ethical dispensing practices."
      ],
      whatWeOffer: [
        "৳32,000 – ৳45,000/mo salary + sales achievement incentives.",
        "Special staff discounts on all medicines, healthcare products, and lab diagnostics.",
        "2 Festival bonuses + health insurance coverage.",
        "Structured shift schedule with overtime compensation."
      ]
    },
    {
      title: "Sales & Customer Relations Executive",
      company: "Prime Retail Mart",
      category: "Sales",
      salary: "৳25,000 – ৳35,000/mo + Comm",
      type: "Full-time",
      tags: ["Retail Sales", "Customer Service"],
      dLat: -0.0024,
      dLng: 0.0042,
      logo: "🛍️",
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80",
      exp: "HSC / Graduate",
      desc: "Showroom customer assistance, billing and product merchandising. Performance commission on monthly targets.",
      deadline: "18 Oct 2026",
      workplaceType: "Retail Showroom Outlet",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=primeretail-sales-exec",
      responsibilities: [
        "Greet showroom visitors warmly, understand customer requirements, and showcase relevant products.",
        "Achieve monthly sales targets through consultative selling and upselling premium items.",
        "Manage POS billing, inventory tagging, product merchandising, and display aesthetics.",
        "Handle customer feedback, return requests, and after-sales warranty support courteously."
      ],
      qualifications: [
        "HSC or Bachelor’s degree in any discipline (Marketing/Business preferred).",
        "Energetic, pleasant personality with persuasive communication in Bengali & conversational English.",
        "1+ years of retail sales, customer service, or showroom experience."
      ],
      whatWeOffer: [
        "৳25,000 – ৳35,000/mo fixed salary + uncapped monthly sales commission.",
        "2 Festival bonuses + Yearly performance appraisal.",
        "Subsidized meal allowance and monthly product discount coupons."
      ]
    },
    {
      title: "UI/UX & Visual Designer",
      company: "PixelCraft Design Studio",
      category: "Design",
      salary: "৳50,000 – ৳75,000/mo",
      type: "Full-time",
      tags: ["Figma", "Mobile UI", "Portfolio"],
      dLat: 0.0046,
      dLng: 0.0018,
      logo: "🎨",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80",
      exp: "Portfolio required",
      desc: "Designing intuitive mobile app interfaces, design systems and interactive prototypes for high-growth tech startups.",
      deadline: "28 Oct 2026",
      workplaceType: "Design Agency Studio",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=pixelcraft-uiux-designer",
      responsibilities: [
        "Design engaging mobile application workflows, wireframes, high-fidelity prototypes, and UI components in Figma.",
        "Build and maintain scalable design systems, visual style guides, and interactive micro-animations.",
        "Conduct user research, usability testing, and translate user feedback into intuitive UI solutions.",
        "Collaborate with frontend engineers to ensure pixel-perfect design implementation."
      ],
      qualifications: [
        "Strong portfolio showcasing web and mobile app design projects (Figma, Prototyping).",
        "1-3 years of proven experience in UI/UX design or visual product design.",
        "Deep understanding of typography, color harmony, responsive grids, and design tokens."
      ],
      whatWeOffer: [
        "৳50,000 – ৳75,000/mo competitive compensation.",
        "Brand new MacBook Pro & high-res monitor workstation.",
        "Flexible hybrid working arrangement (2 days remote per week).",
        "Annual learning stipend for design courses and conferences."
      ]
    },
    {
      title: "Branch Operations Supervisor",
      company: "National Logistics Hub",
      category: "Operations",
      salary: "৳38,000 – ৳52,000/mo",
      type: "Full-time",
      tags: ["Warehouse", "Team Leadership"],
      dLat: -0.0042,
      dLng: 0.0035,
      logo: "📦",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
      exp: "2+ yrs experience",
      desc: "Supervising hub operations, vehicle loading schedules and package routing with dispatch teams.",
      deadline: "22 Oct 2026",
      workplaceType: "Central Hub Facility",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=nationallogistics-supervisor",
      responsibilities: [
        "Direct daily hub warehouse logistics, parcel sorting, dispatch scheduling, and vehicle load management.",
        "Supervise a team of dispatch staff and delivery agents to ensure on-time delivery SLAs.",
        "Audit inbound and outbound inventory manifests and resolve delivery discrepancies promptly.",
        "Enforce safety and workplace security protocols across the branch facility."
      ],
      qualifications: [
        "2+ years of supervisory experience in courier, supply chain, warehouse, or logistics operations.",
        "Graduate in Business, Supply Chain, or relevant field.",
        "Strong problem-solving, team management, and organizational abilities."
      ],
      whatWeOffer: [
        "৳38,000 – ৳52,000/mo salary package.",
        "Monthly operational performance bonus + Festival allowances.",
        "Official smartphone and corporate mobile bill allowance.",
        "Fast-track promotion path to Regional Logistics Manager."
      ]
    },
    {
      title: "Digital Marketing & Content Specialist",
      company: "GrowthWave Media",
      category: "Marketing",
      salary: "৳30,000 – ৳45,000/mo",
      type: "Part-time",
      tags: ["Social Media", "SEO", "Copywriting"],
      dLat: 0.0055,
      dLng: -0.0045,
      logo: "📱",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80",
      exp: "Content & Ad management",
      desc: "Managing social media campaigns, SEO content strategy and Google ads for e-commerce brands.",
      deadline: "31 Oct 2026",
      workplaceType: "Flexible / Hybrid",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=growthwave-digital-marketing",
      responsibilities: [
        "Plan and execute social media campaigns across Meta, TikTok, LinkedIn, and YouTube.",
        "Create engaging visual content, short video scripts, and SEO-optimized promotional copy.",
        "Run targeted Google Ads and Meta Ads campaigns, monitor ROAS, and optimize conversion funnels.",
        "Track marketing analytics, prepare performance dashboards, and identify growth opportunities."
      ],
      qualifications: [
        "1-2 years experience in digital marketing, social media management, or content creation.",
        "Hands-on expertise with Meta Ads Manager, Google Analytics, Canva / Photoshop, and SEO tools.",
        "Creative mindset with strong Bengali & English copywriting skills."
      ],
      whatWeOffer: [
        "৳30,000 – ৳45,000/mo flexible salary.",
        "Performance bonus linked to campaign conversion milestones.",
        "Flexible part-time hours with remote work capability."
      ]
    },
    {
      title: "Electrical & Maintenance Technician",
      company: "SmartFix Facility Services",
      category: "Technical",
      salary: "৳28,000 – ৳36,000/mo",
      type: "Full-time",
      tags: ["Wiring", "HVAC Maintenance"],
      dLat: -0.0048,
      dLng: -0.0036,
      logo: "⚡",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
      exp: "Technical Trade certificate",
      desc: "Commercial facility electrical troubleshooting, generator maintenance and HVAC servicing.",
      deadline: "19 Oct 2026",
      workplaceType: "Commercial Facility (On-site)",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=smartfix-technician",
      responsibilities: [
        "Conduct routine inspections and preventive maintenance on electrical systems, wiring, and DB boards.",
        "Troubleshoot and repair commercial HVAC units, central air conditioning, and backup generators.",
        "Respond swiftly to emergency power interruptions, fixture faults, and facility maintenance calls.",
        "Maintain safety gear, equipment logs, and spare parts inventory."
      ],
      qualifications: [
        "Technical Trade Certificate / Diploma in Electrical Engineering (ABC License preferred).",
        "2+ years of hands-on experience in commercial facility or building electrical maintenance.",
        "Strong understanding of electrical safety codes, circuit diagnostics, and HVAC servicing."
      ],
      whatWeOffer: [
        "৳28,000 – ৳36,000/mo salary with overtime payment.",
        "Complete safety gear, tool kit, and company uniform provided.",
        "Medical insurance for accidental injuries + Festival bonuses."
      ]
    },
    {
      title: "Quality Assurance (QA) Engineer",
      company: "SoftVibe Technologies",
      category: "IT & Software",
      salary: "৳55,000 – ৳80,000/mo",
      type: "Full-time",
      tags: ["Manual & Automation", "Postman"],
      dLat: 0.0061,
      dLng: 0.0052,
      logo: "🔍",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
      exp: "1-3 yrs QA experience",
      desc: "Writing test cases, API testing and bug tracking for fintech web & mobile applications.",
      deadline: "26 Oct 2026",
      workplaceType: "Hybrid (Dhaka Tech Hub)",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=softvibe-qa-engineer",
      responsibilities: [
        "Develop comprehensive test plans, test suites, and edge-case test matrices for web & mobile apps.",
        "Perform manual and automated API testing using Postman, Cypress, or Playwright.",
        "Identify, document, and track software bugs with detailed reproduction steps in Jira.",
        "Collaborate with developers in agile sprints to verify bug fixes before production releases."
      ],
      qualifications: [
        "1-3 years of QA engineering experience in SaaS, fintech, or e-commerce platforms.",
        "Solid understanding of SDLC, STLC, regression testing, and REST API testing.",
        "Bachelor’s degree in Computer Science, IT, or equivalent experience."
      ],
      whatWeOffer: [
        "৳55,000 – ৳80,000/mo competitive salary.",
        "Yearly performance bonus, Provident Fund, and health insurance.",
        "Remote-friendly culture with flexible timings."
      ]
    },
    {
      title: "Call Center & Customer Support Agent",
      company: "ConnectGlobal BPO",
      category: "Customer Care",
      salary: "৳24,000 – ৳32,000/mo",
      type: "Part-time",
      tags: ["Inbound Calls", "Night/Day Shift"],
      dLat: -0.0058,
      dLng: 0.0062,
      logo: "🎧",
      image: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80",
      exp: "Fluent English & Bengali",
      desc: "Handling inbound customer queries via phone and live chat. Professional air-conditioned workstation with pick & drop.",
      deadline: "Rolling / Immediate",
      workplaceType: "BPO Center (Air-conditioned)",
      applyUrl: "https://bdjobs.com/jobdetails.asp?id=connectglobal-support-agent",
      responsibilities: [
        "Handle inbound customer calls, live chats, and email queries with warmth and efficiency.",
        "Troubleshoot order inquiries, service issues, and provide accurate product information.",
        "Log customer interaction notes in CRM and escalate complex tickets to specialist teams.",
        "Maintain high customer satisfaction (CSAT) scores and first-call resolution rates."
      ],
      qualifications: [
        "Fluent verbal and written communication in Bengali and English.",
        "Minimum HSC / Graduate in any discipline.",
        "Calm, patient problem-solving attitude with good typing speed (30+ WPM)."
      ],
      whatWeOffer: [
        "৳24,000 – ৳32,000/mo salary + monthly attendance and performance incentives.",
        "Free pick-and-drop facility for night shift agents.",
        "Modern air-conditioned office environment with tea/coffee and gaming lounge."
      ]
    }
  ];

  return templateList.map((tmpl, idx) => {
    const jobLat = lat + tmpl.dLat;
    const jobLng = lng + tmpl.dLng;
    const distKm = getDistanceKm(lat, lng, jobLat, jobLng);
    const isNearby = distKm <= 2.0;

    return {
      id: `live-job-${idx + 1}`,
      title: tmpl.title,
      company: tmpl.company,
      location: `${area}, ${city}`,
      city: city,
      salary: tmpl.salary,
      type: tmpl.type as any,
      category: tmpl.category,
      distance: formatDistance(distKm),
      distanceKm: distKm,
      isNearby: isNearby,
      lat: jobLat,
      lng: jobLng,
      logo: tmpl.logo,
      image: tmpl.image,
      posted: `${(idx % 4) + 1}h ago`,
      description: tmpl.desc,
      skills: tmpl.tags,
      experience: tmpl.exp,
      contactPhone: `+880 17${Math.floor(10000000 + Math.random() * 90000000)}`,
      contactEmail: `hr@${tmpl.company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      spots: (idx % 3) + 1,
      responsibilities: tmpl.responsibilities,
      qualifications: tmpl.qualifications,
      whatWeOffer: tmpl.whatWeOffer,
      applyUrl: tmpl.applyUrl,
      deadline: tmpl.deadline,
      workplaceType: tmpl.workplaceType
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}
