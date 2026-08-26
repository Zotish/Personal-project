import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Briefcase, DollarSign, Clock, Star,
  Shield, CheckCircle2, Phone, MessageCircle, ExternalLink,
  ChevronRight, Filter, ChevronLeft, Bookmark, BookmarkCheck,
  Send, Sparkles, Home, Building2, User, Layers, Eye, X,
  Map as MapIcon, ArrowUpRight, ArrowRight, Compass, Check, AlertCircle,
  Plus, Minus, RotateCcw, Navigation, RefreshCw, Loader2,
  Lock, AlertTriangle, Car, Bike, Footprints, ChevronDown, ChevronUp, ArrowLeft, Route,
  GraduationCap, Gift, Share2
} from "lucide-react";
import type { Map as LeafletMapType } from "leaflet";

// ─── BariKoi API Key & Loader ───────────────────────────────────────────────

const BARIKOI_API_KEY = import.meta.env.VITE_BARIKOI_API_KEY || "bkoi_e25928917c9e7b36a3286d75f446427fa3433bf87361b2fd8c8d6c942300a38f";

function loadBkoiGL(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).bkoigl) {
      resolve((window as any).bkoigl);
      return;
    }
    if (!document.getElementById("maplibre-gl-css")) {
      const css = document.createElement("link");
      css.id = "maplibre-gl-css";
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
      document.head.appendChild(css);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/bkoi-gl@latest/dist/iife/bkoi-gl.js";
    script.onload = () => resolve((window as any).bkoigl);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export interface BariKoiGeoResult {
  address: string;
  area: string;
  district: string;
  sub_district: string;
  postCode: string;
  city: string;
}

// ─── BariKoi Reverse Geocode API ────────────────────────────────────────────

async function fetchBariKoiReverseGeocode(lat: number, lng: number): Promise<BariKoiGeoResult | null> {
  const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${BARIKOI_API_KEY}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true&bangla=true`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data?.place) {
      return {
        address: data.place.address || data.place.area || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        area: data.place.area || data.place.sub_district || data.place.district || "Your Area",
        district: data.place.district || "",
        sub_district: data.place.sub_district || "",
        postCode: data.place.postCode || "",
        city: data.place.city || data.place.division || "Dhaka",
      };
    }
  } catch (err) {
    console.warn("BariKoi Reverse Geocode error:", err);
  }
  return null;
}

// ─── Distance Helpers ───────────────────────────────────────────────────────

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

// ─── Real Turn-by-Turn Road Routing Helper (Google Maps / OSRM Standard) ───

async function fetchRealRoadRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<{
  coordinates: [number, number][];
  distanceText: string;
  durationText: string;
}> {
  // 1. Primary: High-Precision Turn-by-Turn Driving Road Router
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&continue_straight=true&steps=true`;
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords: [number, number][] = route.geometry.coordinates; // Strict road network nodes
        if (rawCoords && rawCoords.length > 1) {
          const distKm = route.distance / 1000;
          const mins = Math.max(1, Math.round(route.duration / 60));
          return {
            coordinates: rawCoords, // Follows ONLY real road paths
            distanceText: `${distKm.toFixed(1)} km`,
            durationText: `~${mins} mins`
          };
        }
      }
    }
  } catch (err) {
    console.warn("OSRM routing attempt 1 failed:", err);
  }

  // 2. Secondary: OpenStreetMap DE Road Network Router
  try {
    const osmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(osmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords: [number, number][] = route.geometry.coordinates;
        if (rawCoords && rawCoords.length > 1) {
          const distKm = route.distance / 1000;
          const mins = Math.max(1, Math.round(route.duration / 60));
          return {
            coordinates: rawCoords,
            distanceText: `${distKm.toFixed(1)} km`,
            durationText: `~${mins} mins`
          };
        }
      }
    }
  } catch (err) {
    console.warn("OSM routing attempt 2 failed:", err);
  }

  // 3. Fallback: Direct Road Line
  const directDist = getDistanceKm(startLat, startLng, endLat, endLng);
  return {
    coordinates: [
      [startLng, startLat],
      [endLng, endLat]
    ],
    distanceText: `${directDist.toFixed(1)} km`,
    durationText: `~${Math.max(1, Math.round(directDist * 3.5))} mins`
  };
}

// ─── Data Types ─────────────────────────────────────────────────────────────

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

// ─── Dynamic Live Location Jobs Generator ───────────────────────────────────

function generateLiveLocationJobs(lat: number, lng: number, areaName: string, cityName: string): LiveJobListing[] {
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

// ─── BariKoi Interactive Live Map Component ─────────────────────────────────

function BariKoiLiveJobsMap({
  userCoords,
  isLocationGranted,
  jobs,
  selectedJob,
  onSelectJob,
  onNavigationClick,
  onRequestLocation,
  onDenyLocation,
  showPermissionPrompt,
  isLocating,
  directionJob,
  onClearDirection,
  onShowDirection,
  onApplyJob,
  savedJobIds,
  onToggleSave
}: {
  userCoords: [number, number];
  isLocationGranted: boolean;
  jobs: LiveJobListing[];
  selectedJob: LiveJobListing | null;
  onSelectJob: (job: LiveJobListing | null) => void;
  onNavigationClick: () => void;
  onRequestLocation: () => void;
  onDenyLocation: () => void;
  showPermissionPrompt: boolean;
  isLocating: boolean;
  directionJob: LiveJobListing | null;
  onClearDirection: () => void;
  onShowDirection: (job: LiveJobListing) => void;
  onApplyJob?: (job: LiveJobListing) => void;
  savedJobIds?: string[];
  onToggleSave?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const lastCoordinatesRef = useRef<[number, number][] | null>(null);

  // Helper to create HTML for Job Marker
  const createJobMarkerHtml = (job: LiveJobListing, isSelected: boolean) => {
    const bg = isSelected ? "#8C3015" : "#C04A22";
    const size = isSelected ? 38 : 32;
    return `
      <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s ease;">
        ${isSelected ? '<div style="position:absolute;top:-4px;left:-4px;width:' + (size + 8) + 'px;height:' + (size + 8) + 'px;border-radius:50%;background:rgba(192,74,34,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
        <div style="background:${bg};color:white;width:${size}px;height:${size}px;border-radius:50%;border:${isSelected ? '3px' : '2px'} solid white;box-shadow:${isSelected ? '0 8px 20px rgba(192,74,34,0.5)' : '0 3px 10px rgba(0,0,0,0.25)'};display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.1)' : 'scale(1)'};">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${bg};margin-top:-1px;"></div>
      </div>
    `;
  };

  // Precise Live GPS User Location Marker (Pulsing Radar Pinpoint Dot)
  const createUserMarkerHtml = () => `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;">
      <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(37,99,235,0.25);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(37,99,235,0.35);border:2px solid #ffffff;box-shadow:0 0 12px rgba(37,99,235,0.4);"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#1d4ed8;border:3px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);"></div>
    </div>
  `;

  // Sync Markers to Map
  const syncMapMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bkoigl = (window as any).bkoigl;
    const L = LRef.current;

    // 1. Sync / Update User Live GPS Marker ONLY if permission is granted
    if (isLocationGranted) {
      if (userMarkerRef.current) {
        if (userMarkerRef.current.setLngLat) {
          userMarkerRef.current.setLngLat([userCoords[1], userCoords[0]]);
        } else if (userMarkerRef.current.setLatLng) {
          userMarkerRef.current.setLatLng(userCoords);
        }
      } else {
        if (L && map.addLayer) {
          const userIcon = L.divIcon({
            className: "bkoi-user-marker",
            html: createUserMarkerHtml(),
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          const userM = L.marker(userCoords, { icon: userIcon }).addTo(map);
          userMarkerRef.current = userM;
        } else if (bkoigl || map.project) {
          const el = document.createElement("div");
          el.innerHTML = createUserMarkerHtml();
          const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
          if (MarkerClass) {
            const userM = new MarkerClass({ element: el })
              .setLngLat([userCoords[1], userCoords[0]])
              .addTo(map);
            userMarkerRef.current = userM;
          }
        }
      }
    } else {
      if (userMarkerRef.current) {
        if (userMarkerRef.current.remove) userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }

    // 2. Clear old Job Markers
    markersRef.current.forEach(m => {
      if (m.remove) m.remove();
    });
    markersRef.current = [];

    // 3. Add Job Markers around live location
    jobs.forEach(job => {
      const isSelected = selectedJob?.id === job.id;
      if (L && map.addLayer) {
        const icon = L.divIcon({
          className: "bkoi-job-marker",
          html: createJobMarkerHtml(job, isSelected),
          iconSize: isSelected ? [38, 44] : [32, 38],
          iconAnchor: isSelected ? [19, 44] : [16, 38]
        });
        const marker = L.marker([job.lat, job.lng], { icon }).addTo(map);
        marker.on("click", () => onSelectJob(job));
        markersRef.current.push(marker);
      } else if (bkoigl || map.project) {
        const el = document.createElement("div");
        el.innerHTML = createJobMarkerHtml(job, isSelected);
        el.style.cursor = "pointer";
        el.addEventListener("click", () => onSelectJob(job));

        const MarkerClass = bkoigl?.Marker || (window as any).maplibregl?.Marker;
        if (MarkerClass) {
          const marker = new MarkerClass({ element: el })
            .setLngLat([job.lng, job.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });
  }, [jobs, userCoords, isLocationGranted, selectedJob, onSelectJob]);

  // Init BariKoi GL SDK / Leaflet Fallback
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    loadBkoiGL()
      .then(bkoigl => {
        if (!containerRef.current || mapRef.current) return;
        const key = BARIKOI_API_KEY;
        if (bkoigl) {
          bkoigl.accessToken = key;
          bkoigl.apiKey = key;
        }

        const map = new bkoigl.Map({
          container: containerRef.current!,
          center: [userCoords[1], userCoords[0]], // [lng, lat]
          zoom: 14.6,
          accessToken: key,
          apiKey: key,
          attributionControl: false,
          style: `https://map.barikoi.com/styles/osm_barikoi_v1/style.json?key=${key}`,
        });

        // Gracefully handle missing sprite icons/layers from Barikoi style
        map.on("styleimagemissing", (e: any) => {
          const id = e.id;
          if (!map.hasImage(id)) {
            const canvas = document.createElement("canvas");
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const imgData = ctx.createImageData(1, 1);
              map.addImage(id, imgData);
            }
          }
        });

        map.on("error", (e: any) => {
          if (
            e?.error?.message?.includes("Source layer") ||
            e?.error?.message?.includes("does not exist") ||
            e?.error?.message?.includes("office_11")
          ) {
            return;
          }
        });

        map.on("load", () => {
          mapRef.current = map;
          syncMapMarkers();
        });
        mapRef.current = map;
      })
      .catch(() => {
        // Fallback to Leaflet with BariKoi tiles
        import("leaflet").then(L => {
          if (!containerRef.current || mapRef.current) return;
          delete (L.Icon.Default.prototype as any)._getIconUrl;

          const map = L.map(containerRef.current!, {
            center: userCoords,
            zoom: 15,
            zoomControl: false,
            attributionControl: false
          });

          L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
            {
              maxZoom: 19,
            }
          ).addTo(map);

          mapRef.current = map;
          LRef.current = L;
          syncMapMarkers();
        });
      });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (_) {}
        mapRef.current = null;
      }
    };
  }, []);

  // Update map center & pinpoint when user location updates
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (map.flyTo) {
      map.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 14.8, speed: 1.5 });
    } else if (map.setView) {
      map.setView(userCoords, 15);
    }
    syncMapMarkers();
  }, [userCoords, syncMapMarkers]);

  // Update markers when selection or job list changes
  useEffect(() => {
    syncMapMarkers();
  }, [syncMapMarkers]);

  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Fly to selected job or draw real turn-by-turn road route to direction job
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = LRef.current;

    // Handle Real Road Direction Route
    if (directionJob) {
      const userLat = userCoords[0];
      const userLng = userCoords[1];
      const jobLat = directionJob.lat;
      const jobLng = directionJob.lng;

      let isCancelled = false;

      fetchRealRoadRoute(userLat, userLng, jobLat, jobLng).then(routeData => {
        if (isCancelled || !mapRef.current) return;

        setRouteInfo({
          distanceText: routeData.distanceText,
          durationText: routeData.durationText
        });

        const coordinates = routeData.coordinates; // [[lng, lat], ...]
        lastCoordinatesRef.current = coordinates;

        // 1. Draw Real Road Route in Leaflet
        if (L && map.addLayer) {
          if (routeLineRef.current) {
            try { routeLineRef.current.remove(); } catch (_) {}
          }

          const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);

          // Draw main road polyline following actual streets and lanes
          const line = L.polyline(latLngs, {
            color: "#C04A22",
            weight: 6,
            opacity: 0.95,
            lineJoin: "round",
            lineCap: "round"
          }).addTo(map);

          routeLineRef.current = line;

          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
        } else if (map.getSource) {
          // 2. Draw Real Road Route in BariKoi GL / MapLibre
          const routeGeoJson: any = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates
            }
          };

          if (map.getSource("direction-route")) {
            map.getSource("direction-route").setData(routeGeoJson);
          } else {
            try {
              map.addSource("direction-route", {
                type: "geojson",
                data: routeGeoJson
              });

              // Casing (White outer glow for prominent road line)
              map.addLayer({
                id: "direction-route-casing",
                type: "line",
                source: "direction-route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round"
                },
                paint: {
                  "line-color": "#ffffff",
                  "line-width": 9,
                  "line-opacity": 0.95
                }
              });

              // Main Road Polyline
              map.addLayer({
                id: "direction-route-line",
                type: "line",
                source: "direction-route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round"
                },
                paint: {
                  "line-color": "#C04A22",
                  "line-width": 6,
                  "line-opacity": 1
                }
              });
            } catch (_) {}
          }

          // Calculate exact bounds from road coordinates
          let minLng = coordinates[0][0], maxLng = coordinates[0][0];
          let minLat = coordinates[0][1], maxLat = coordinates[0][1];
          coordinates.forEach(([cLng, cLat]) => {
            if (cLng < minLng) minLng = cLng;
            if (cLng > maxLng) maxLng = cLng;
            if (cLat < minLat) minLat = cLat;
            if (cLat > maxLat) maxLat = cLat;
          });

          if (map.fitBounds) {
            map.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat]
              ],
              { padding: 75, maxZoom: 16, duration: 1200 }
            );
          }
        }
      });

      return () => {
        isCancelled = true;
      };
    } else {
      setRouteInfo(null);
      // Clear route line if direction cancelled
      if (routeLineRef.current) {
        try { routeLineRef.current.remove(); } catch (_) {}
        routeLineRef.current = null;
      }
      if (map.getSource && map.getSource("direction-route")) {
        try {
          map.getSource("direction-route").setData({
            type: "FeatureCollection",
            features: []
          });
        } catch (_) {}
      }

      // If no direction, fly to selected job if present
      if (selectedJob) {
        if (map.flyTo) {
          map.flyTo({
            center: [selectedJob.lng, selectedJob.lat],
            zoom: 15.5,
            speed: 1.2
          });
        } else if (map.panTo) {
          map.panTo([selectedJob.lat, selectedJob.lng]);
        }
      }
    }
  }, [directionJob, selectedJob, userCoords]);

  // Zoom Controls
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    if (mapRef.current.zoomIn) mapRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (!mapRef.current) return;
    if (mapRef.current.zoomOut) mapRef.current.zoomOut();
  };
  const handleReset = () => {
    onNavigationClick();
    if (mapRef.current) {
      if (mapRef.current.flyTo) {
        mapRef.current.flyTo({ center: [userCoords[1], userCoords[0]], zoom: 15.5, speed: 1.5 });
      } else if (mapRef.current.setView) {
        mapRef.current.setView(userCoords, 15.5);
      }
    }
  };

  const [travelMode, setTravelMode] = useState<"car" | "bike" | "walk">("car");
  const [isNavCardMinimized, setIsNavCardMinimized] = useState(false);

  // Re-open card whenever a new direction job is selected
  useEffect(() => {
    if (directionJob) {
      setIsNavCardMinimized(false);
    }
  }, [directionJob]);

  // Whenever map height changes between expanded / minimized / normal, resize and refit bounds cleanly
  useEffect(() => {
    const handleResize = () => {
      if (!mapRef.current) return;
      if (mapRef.current.resize) {
        mapRef.current.resize();
      } else if (mapRef.current.invalidateSize) {
        mapRef.current.invalidateSize();
      }

      // If we have an active route, re-fit the bounds so it fills the new visible map height perfectly!
      if (directionJob && lastCoordinatesRef.current && lastCoordinatesRef.current.length > 0) {
        const coords = lastCoordinatesRef.current;
        if (mapRef.current.fitBounds) {
          let minLng = coords[0][0], maxLng = coords[0][0];
          let minLat = coords[0][1], maxLat = coords[0][1];
          coords.forEach(([cLng, cLat]) => {
            if (cLng < minLng) minLng = cLng;
            if (cLng > maxLng) maxLng = cLng;
            if (cLat < minLat) minLat = cLat;
            if (cLat > maxLat) maxLat = cLat;
          });
          mapRef.current.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 35, maxZoom: 16.5, duration: 600 }
          );
        } else if (LRef.current && mapRef.current.fitBounds) {
          const latLngs = coords.map(([lng, lat]) => [lat, lng]);
          const bounds = LRef.current.latLngBounds(latLngs);
          mapRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 16.5 });
        }
      }
    };

    const t1 = setTimeout(handleResize, 80);
    const t2 = setTimeout(handleResize, 310);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [directionJob, isNavCardMinimized]);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden transition-all duration-300">
      {/* ── MAP CONTAINER (Dynamic Height depending on route card state) ── */}
      <div
        className={`relative w-full transition-[height] duration-300 ease-in-out ${
          directionJob
            ? isNavCardMinimized
              ? "h-[380px] sm:h-[470px] md:h-[530px] lg:h-[590px]" // Minimized: map extends close to the bottom bar
              : "h-[250px] sm:h-[320px] md:h-[380px] lg:h-[430px]" // Expanded: map shortens so whole route fits above the expanded card
            : "h-[480px] sm:h-[560px] md:h-[620px] lg:h-[680px]" // Default full height
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* ── Selected Job Card Overlay on Marker Click (When NOT in route direction mode) ── */}
        {selectedJob && !directionJob && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:left-4 sm:bottom-4 z-30 w-auto sm:w-[330px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in slide-in-from-bottom-3 duration-250 pointer-events-auto">
            {/* Banner Image with Type, Bookmark & Distance Badges (Compact Height) */}
            <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
              <img
                src={selectedJob.image}
                alt={selectedJob.title}
                className="w-full h-full object-cover"
              />
              {/* Top Right: Type Badge & Close button */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-xs border border-slate-200/60">
                  {selectedJob.type}
                </div>
                <button
                  onClick={() => onSelectJob(null)}
                  className="w-6.5 h-6.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 flex items-center justify-center shadow transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top Left: Bookmark Save Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onToggleSave?.(selectedJob.id);
                }}
                className="absolute top-2 left-2 w-7.5 h-7.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-700 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                title={savedJobIds?.includes(selectedJob.id) ? "Saved" : "Save Job"}
              >
                {savedJobIds?.includes(selectedJob.id) ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#C04A22]" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Bottom Left: Distance Badge on Image */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{selectedJob.distance}</span>
              </div>
            </div>

            {/* Card Body (No Description for Minimal Sleek Height) */}
            <div className="p-3 sm:p-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {selectedJob.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {selectedJob.company} • {selectedJob.location}
              </p>

              {/* Salary Pill */}
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full bg-orange-50/80 text-[#C04A22] text-xs font-bold border border-orange-100/60 inline-block">
                  {selectedJob.salary}
                </span>
              </div>

              {/* Action Buttons: Direction & Details */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onShowDirection(selectedJob);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                  title="Show direction route from your location"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                  <span>Direction</span>
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onApplyJob?.(selectedJob);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C04A22]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Center Permission Prompt: Left Allow, Right X (Deny) */}
        {showPermissionPrompt && !isLocationGranted && !directionJob && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-slate-200/90 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestLocation();
              }}
              disabled={isLocating}
              className="px-4 py-1.5 rounded-xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-75"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                "Allow"
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDenyLocation();
              }}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              title="Deny"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Map Controls: Zoom In / Out / Recenter (Top Right) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
            title="Zoom In"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center transition cursor-pointer hover:text-[#C04A22]"
            title="Zoom Out"
          >
            <Minus className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleReset}
            disabled={isLocating}
            className={`w-9 h-9 rounded-xl shadow-md border transition cursor-pointer active:scale-95 disabled:opacity-75 flex items-center justify-center ${
              isLocationGranted
                ? "bg-[#C04A22] text-white border-[#C04A22] shadow-[#C04A22]/30"
                : "bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 border-slate-200/80 hover:text-[#C04A22]"
            }`}
            title={isLocationGranted ? "Live Location Active (Click to Turn OFF)" : "Turn ON Live Location (GPS)"}
          >
            {isLocating ? (
              <Loader2 className={`w-4.5 h-4.5 animate-spin ${isLocationGranted ? "text-white" : "text-[#C04A22]"}`} />
            ) : (
              <Navigation className={`w-4.5 h-4.5 ${isLocationGranted ? "text-white" : "text-[#C04A22]"}`} />
            )}
          </button>
        </div>
      </div>

      {/* ── ROUTE NAVIGATION CARD (Outside Map Canvas - Sits directly below the map!) ── */}
      {directionJob && (
        <div className="w-full bg-[#FAFAFA] border-t border-slate-200/90 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300">
          {/* 1. Minimized Route Bar (Matching Screenshot 2) */}
          {isNavCardMinimized ? (
            <div
              onClick={() => setIsNavCardMinimized(false)}
              className="w-full bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-200/90 flex items-center justify-between gap-3 cursor-pointer hover:border-[#C04A22]/40 transition"
              title="Click to view route details"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-[#C04A22]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {directionJob.title}
                  </div>
                  <div className="text-xs text-[#C04A22] font-bold">
                    ({directionJob.distanceKm.toFixed(1)} km)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNavCardMinimized(false);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="Expand Card"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearDirection();
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                  title="Clear Route"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* 2. Expanded Route Navigation Card (Matching Screenshot 1) */
            <div className="w-full bg-white rounded-3xl p-3.5 sm:p-4 shadow-xs border border-slate-200/90 animate-in slide-in-from-bottom-2 duration-250">
              {/* Drag Handle Top Bar */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2.5" />

              {/* Header: Back Arrow, Origin & Destination Hierarchy, Collapse Chevron */}
              <div className="flex items-center justify-between gap-2.5 mb-3">
                <button
                  onClick={onClearDirection}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer flex-shrink-0"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-[#C04A22] flex-shrink-0" />
                    <span className="truncate">Your Location</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 truncate mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                    <span className="truncate">{directionJob.title}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsNavCardMinimized(true)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer flex-shrink-0"
                  title="Minimize Card"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Travel Mode Switcher Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setTravelMode("car")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "car"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>
                <button
                  onClick={() => setTravelMode("bike")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "bike"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Bike</span>
                </button>
                <button
                  onClick={() => setTravelMode("walk")}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    travelMode === "walk"
                      ? "bg-[#C04A22]/12 text-[#8C3015] border border-[#C04A22]/25 shadow-2xs"
                      : "bg-slate-100/90 hover:bg-[#C04A22]/8 text-slate-600 hover:text-[#8C3015] border border-transparent"
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walking</span>
                </button>
              </div>

              {/* 3 Stats Metric Grid (Time, Distance, Cost) */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                {/* Time */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {travelMode === "car"
                      ? `${Math.max(1, Math.round(directionJob.distanceKm * 2.5))} min`
                      : travelMode === "bike"
                      ? `${Math.max(2, Math.round(directionJob.distanceKm * 4.5))} min`
                      : `${Math.max(5, Math.round(directionJob.distanceKm * 12))} min`}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Time</div>
                </div>

                {/* Distance */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {directionJob.distanceKm.toFixed(1)} km
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Distance</div>
                </div>

                {/* Cost */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex flex-col items-center justify-center">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    ${(directionJob.distanceKm * 0.16 + 0.45).toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">Cost</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Live Jobs Page ────────────────────────────────────────────────────

export function Jobs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [showApplyModal, setShowApplyModal] = useState<LiveJobListing | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Permission State: "prompt", "granted", or "denied"
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

  // Default initial coordinates for map view before permission (Dhaka center)
  const defaultCoords: [number, number] = [23.8103, 90.4125];
  const [userCoords, setUserCoords] = useState<[number, number]>(defaultCoords);
  const [userLocationName, setUserLocationName] = useState<string>("Dhaka");
  const [userArea, setUserArea] = useState<string>("Dhaka Area");
  const [userCity, setUserCity] = useState<string>("Dhaka");

  // Dynamic Live Jobs List
  const [liveJobs, setLiveJobs] = useState<LiveJobListing[]>(() =>
    generateLiveLocationJobs(defaultCoords[0], defaultCoords[1], "Dhaka Area", "Dhaka")
  );
  const [selectedJob, setSelectedJob] = useState<LiveJobListing | null>(null);
  const [directionJob, setDirectionJob] = useState<LiveJobListing | null>(null);


  // Request Live GPS Location strictly from device GPS when navigation button is clicked
  const executeGeolocation = useCallback((highAccuracy: boolean = true) => {
    setIsLocating(true);
    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocationPermissionStatus("granted");
        setIsLocationGranted(true);
        setShowPermissionPrompt(false);
        setUserCoords([lat, lng]);

        try {
          localStorage.setItem("bkoi_last_user_coords", JSON.stringify([lat, lng]));
        } catch (_) {}

        // Fetch real address from BariKoi Reverse Geocode API
        const geoResult = await fetchBariKoiReverseGeocode(lat, lng);
        if (geoResult) {
          const area = geoResult.area || geoResult.sub_district || "Your Location";
          const city = geoResult.city || "Live City";
          setUserLocationName(geoResult.address || `${area}, ${city}`);
          setUserArea(area);
          setUserCity(city);

          // Generate jobs around exact live coordinates
          const generated = generateLiveLocationJobs(lat, lng, area, city);
          setLiveJobs(generated);
        } else {
          const generated = generateLiveLocationJobs(lat, lng, "Near You", "Live City");
          setLiveJobs(generated);
        }
        setIsLocating(false);
      },
      (error) => {
        // If high accuracy fails on desktop/mac, retry once with standard accuracy
        if (highAccuracy) {
          executeGeolocation(false);
          return;
        }
        console.warn("Device geolocation error:", error.code, error.message);
        setIsLocating(false);
        setIsLocationGranted(false);
        if (error.code === 1) {
          setLocationPermissionStatus("denied");
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 6000 : 15000,
        maximumAge: 60000
      }
    );
  }, []);

  // Direction Handler (Sets direction & displays route without jumping scroll position)
  const handleShowDirection = useCallback((job: LiveJobListing) => {
    setDirectionJob(job);
    setSelectedJob(job);
  }, []);

  // Navigation Button Click Handler (Turn ON / Turn OFF Toggle)
  const handleNavigationClick = useCallback(() => {
    if (isLocationGranted) {
      // Turn OFF Location (Revert to default state)
      setIsLocationGranted(false);
      setLocationPermissionStatus("prompt");
      setShowPermissionPrompt(false);
      setUserCoords(defaultCoords);
      setUserLocationName("Dhaka");
      setUserArea("Dhaka Area");
      setUserCity("Dhaka");
      setDirectionJob(null);
      setLiveJobs(generateLiveLocationJobs(defaultCoords[0], defaultCoords[1], "Dhaka Area", "Dhaka"));
      try {
        localStorage.removeItem("bkoi_last_user_coords");
      } catch (_) {}
    } else {
      // Turn ON Location (Direct device permission request)
      executeGeolocation(true);
    }
  }, [isLocationGranted, executeGeolocation, defaultCoords]);

  // Filter Jobs based on Search Query & Filter Pills
  const filteredJobs = liveJobs.filter(job => {
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.skills.some(s => s.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // Filter Pills
    if (activeFilter === "nearby" && !job.isNearby) return false;
    if (activeFilter === "fulltime" && job.type !== "Full-time") return false;
    if (activeFilter === "parttime" && job.type !== "Part-time") return false;

    return true;
  });

  const nearbyJobs = filteredJobs.filter(j => j.isNearby);

  const toggleSave = (id: string) => {
    setSavedJobIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };


  return (
    <AppLayout noPad={true}>
      <div className="w-full min-h-screen bg-[#FAFAFA] pb-16">
        {/* ── TOP STICKY BAR: Search Jobs ───────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Clean rounded search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="search jobs, titles, skills..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C04A22]/20 focus:border-[#C04A22] shadow-2xs transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Short & Understandable Filter Pills */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
            {[
              { id: "all", label: "All Jobs" },
              { id: "nearby", label: "Nearby" },
              { id: "fulltime", label: "Full-time" },
              { id: "parttime", label: "Part-time" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-[#C04A22] text-white shadow-xs font-semibold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── BARIKOI LIVE MAP (EXPANDED HEIGHT & MINIMAL SUBTLE BORDER) ────── */}
        <div id="jobs-map-section" className="w-full max-w-7xl mx-auto px-2 sm:px-4 pt-2 sm:pt-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
            <BariKoiLiveJobsMap
              userCoords={userCoords}
              isLocationGranted={isLocationGranted}
              jobs={filteredJobs}
              selectedJob={selectedJob}
              onSelectJob={job => setSelectedJob(job)}
              onNavigationClick={handleNavigationClick}
              onRequestLocation={() => executeGeolocation(true)}
              onDenyLocation={() => setShowPermissionPrompt(false)}
              showPermissionPrompt={showPermissionPrompt}
              isLocating={isLocating}
              directionJob={directionJob}
              onClearDirection={() => setDirectionJob(null)}
              onShowDirection={handleShowDirection}
              onApplyJob={job => setShowApplyModal(job)}
              savedJobIds={savedJobIds}
              onToggleSave={toggleSave}
            />
          </div>
        </div>

        {/* ── MAIN JOB DIRECTORY CONTENT (2-COLUMN ON DESKTOP) ─────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ════════ LEFT COLUMN: NEARBY FOR YOU (6 cols) ════════ */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                {/* 2-Card Options Matching Screenshot */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Left Option: Nearby Me Jobs */}
                  <div
                    onClick={() => setActiveFilter(activeFilter === "nearby" ? "all" : "nearby")}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                      activeFilter === "nearby"
                        ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                        : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {nearbyJobs.length} jobs nearby
                    </div>
                  </div>

                  {/* Right Option: Full State Jobs */}
                  <div
                    onClick={() => setActiveFilter("all")}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-center sm:text-left ${
                      activeFilter === "all"
                        ? "bg-orange-50/60 border-[#C04A22] ring-1 ring-[#C04A22]/20 shadow-xs"
                        : "bg-slate-50/80 hover:bg-white border-slate-100 hover:border-slate-200 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      {liveJobs.length} full state jobs
                    </div>
                  </div>
                </div>

                {/* Job Cards Feed (Screenshot Style) */}
                <div className="space-y-4">
                  {(activeFilter === "nearby" ? nearbyJobs : liveJobs).map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    const isSaved = savedJobIds.includes(job.id);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[#C04A22] ring-2 ring-[#C04A22]/20 shadow-md"
                            : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Banner Image with Type & Distance Floating Badges */}
                        <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
                          <img
                            src={job.image}
                            alt={job.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-xs border border-slate-200/60">
                            {job.type}
                          </div>
                          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {job.distance}
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleSave(job.id);
                            }}
                            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#C04A22] transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            {job.company} • {job.location}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>

                          {/* Row 1: Salary Pill */}
                          <div className="mt-3.5 flex items-center justify-between">
                            <span className="px-3 py-1.5 rounded-full bg-orange-50/80 text-[#C04A22] text-xs sm:text-sm font-bold border border-orange-100/60">
                              {job.salary}
                            </span>
                          </div>

                          {/* Row 2: Direction & Details Buttons (Side by Side) */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleShowDirection(job);
                              }}
                              className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                              title="Show direction route from your location"
                            >
                              <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                              <span>Direction</span>
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setShowApplyModal(job);
                              }}
                              className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#C04A22]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: ALL LOCAL JOBS DIRECTORY (6 cols) ════════ */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Directory Header Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                      <Briefcase className="w-4 h-4 text-[#C04A22]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Live Jobs Directory
                      </h2>
                      <p className="text-xs text-slate-500">
                        {filteredJobs.length} verified jobs around {userArea}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Cards Feed (Screenshot Style) */}
              <div className="space-y-4">
                {filteredJobs.map(job => {
                  const isSelected = selectedJob?.id === job.id;
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`group bg-white rounded-3xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#C04A22] ring-2 ring-[#C04A22]/20 shadow-md"
                          : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Banner Image with Type & Distance Floating Badges */}
                      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
                        <img
                          src={job.image}
                          alt={job.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-xs border border-slate-200/60">
                          {job.type}
                        </div>
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {job.distance}
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleSave(job.id);
                          }}
                          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-[#C04A22] transition shadow-xs cursor-pointer"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#C04A22] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                          {job.company} • {job.location}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Row 1: Salary Pill */}
                        <div className="mt-3.5 flex items-center justify-between">
                          <span className="px-3 py-1.5 rounded-full bg-orange-50/80 text-[#C04A22] text-xs sm:text-sm font-bold border border-orange-100/60">
                            {job.salary}
                          </span>
                        </div>

                        {/* Row 2: Direction & Details Buttons (Side by Side) */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleShowDirection(job);
                            }}
                            className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
                            title="Show direction route from your location"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#C04A22]" />
                            <span>Direction</span>
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setShowApplyModal(job);
                            }}
                            className="flex-1 px-3.5 py-2 rounded-2xl bg-[#C04A22]/12 hover:bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/25 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C04A22]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ── JOB DETAILS & EXTERNAL APPLICATION MODAL ───────────────────────── */}
        {showApplyModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-5 pb-24 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setShowApplyModal(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[calc(100dvh-150px)] sm:max-h-[82vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header: Actions & Top-Right Apply Button */}
              <div className="px-5 pt-4 pb-2 sm:px-6 sm:pt-5 flex-shrink-0 bg-white">
                {/* Action Controls: Save, Share, Close */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleSave(showApplyModal.id)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#C04A22] flex items-center justify-center transition cursor-pointer"
                      title={savedJobIds.includes(showApplyModal.id) ? "Saved" : "Save Job"}
                    >
                      {savedJobIds.includes(showApplyModal.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-[#C04A22]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: showApplyModal.title,
                            text: `Job Opportunity: ${showApplyModal.title} at ${showApplyModal.company}`,
                            url: window.location.href
                          }).catch(() => {});
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                      title="Share Job"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowApplyModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Highlight Stats Row: Experience & Deadline */}
                <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-2">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center sm:text-left">
                    <div className="text-[11px] text-slate-500 font-medium">Experience</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">{showApplyModal.experience}</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center sm:text-left">
                    <div className="text-[11px] text-slate-500 font-medium">Deadline</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">{showApplyModal.deadline || "Open / Rolling"}</div>
                  </div>
                </div>
              </div>

              {/* Modal Body: 3 Structured Point-by-Point Sections (Scrollable) */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                {/* 1. Responsibilities Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-[#C04A22]" />
                    </div>
                    <span>Key Responsibilities</span>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {showApplyModal.responsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C04A22] mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Qualifications Section */}
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-[#C04A22]" />
                    </div>
                    <span>Requirements & Qualifications</span>
                  </div>

                  {/* Skills Tag Pills */}
                  {showApplyModal.skills && showApplyModal.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-2 mb-2">
                      {showApplyModal.skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-orange-50/80 text-[#8C3015] border border-orange-100/60 text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <ul className="space-y-2 pl-2">
                    {showApplyModal.qualifications.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C04A22] mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. What We Offer Section */}
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <div className="w-7 h-7 rounded-xl bg-[#C04A22]/12 text-[#8C3015] flex items-center justify-center flex-shrink-0">
                      <Gift className="w-4 h-4 text-[#C04A22]" />
                    </div>
                    <span>What We Offer & Benefits</span>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {showApplyModal.whatWeOffer.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sticky Modal Bottom Footer */}
              <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/95 flex items-center justify-between gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const jobToDirect = showApplyModal;
                    setShowApplyModal(null);
                    handleShowDirection(jobToDirect);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-orange-50 text-slate-700 hover:text-[#C04A22] text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
                >
                  <Navigation className="w-4 h-4 text-[#C04A22]" />
                  <span>View Route on Map</span>
                </button>

                <a
                  href={showApplyModal.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-2xl bg-[#C04A22] hover:bg-[#8C3015] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>Apply</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
