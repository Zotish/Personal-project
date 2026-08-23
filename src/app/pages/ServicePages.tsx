import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, MapPin, Star, Clock, ChevronRight, ExternalLink, Briefcase,
  Home, GraduationCap, Heart, Building, Scale, CheckCircle, Filter,
  BookOpen, Calendar, DollarSign, Phone, Globe, Languages, ChevronLeft,
  AlertTriangle, Shield, FileText, ChevronDown, HelpCircle
} from "lucide-react";

// ─── Jobs ───────────────────────────────────────────────────────────────────
export { Jobs } from "./Jobs";

// ─── Housing ────────────────────────────────────────────────────────────────

const listings = [
  { id: 1, title: "2BR Apartment - Jackson Heights", price: "$1,650/mo", beds: "2 bed", baths: "1 bath", sqft: "850 sqft", location: "Jackson Heights, Queens", itin: true, noSSN: true, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=200&fit=crop", features: ["Laundry", "No Fee", "Pets OK"], contact: "+1 (718) 555-0100" },
  { id: 2, title: "Studio Near Flushing", price: "$1,100/mo", beds: "Studio", baths: "1 bath", sqft: "500 sqft", location: "Flushing, Queens", itin: true, noSSN: false, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=200&fit=crop", features: ["Near Subway", "Furnished"], contact: "+1 (718) 555-0200" },
  { id: 3, title: "3BR House - Bronx", price: "$2,100/mo", beds: "3 bed", baths: "2 bath", sqft: "1,200 sqft", location: "Fordham, Bronx", itin: true, noSSN: true, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop", features: ["Backyard", "Parking", "Near School"], contact: "+1 (718) 555-0300" },
];

export function Housing() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Home className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Find Housing</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Immigrant-friendly rentals. Many accept ITIN instead of SSN.</p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search city, neighborhood..." className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["All", "ITIN Accepted", "No SSN Required", "Studio", "1BR", "2BR", "3BR+"].map(f => (
              <button key={f} className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 bg-secondary border border-border text-muted-foreground hover:text-primary transition-all">
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
            <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-primary leading-relaxed">Listings marked "ITIN OK" accept Individual Taxpayer Identification Numbers instead of SSN. Always verify requirements before applying.</p>
          </div>
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              <div className="relative h-40">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {listing.itin && <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">ITIN OK</span>}
                  {listing.noSSN && <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">No SSN</span>}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm font-bold px-3 py-1 rounded-xl">{listing.price}</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{listing.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />{listing.location}
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground mt-2">
                  <span>{listing.beds}</span><span>·</span><span>{listing.baths}</span><span>·</span><span>{listing.sqft}</span>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {listing.features.map(f => <span key={f} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>)}
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition">Contact Landlord</button>
                  <button className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition">
                    <Phone className="w-3.5 h-3.5" />{listing.contact}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Legal Help ─────────────────────────────────────────────────────────────

const legalResources = [
  { id: 1, name: "Queens Legal Services", type: "Nonprofit Legal Aid", languages: ["Bengali", "Spanish", "English"], specialty: "Immigration, Housing, Benefits", price: "Free", rating: 4.8, location: "Jamaica, Queens", phone: "+1 (718) 657-8611", available: true },
  { id: 2, name: "Nadia Islam Law Firm", type: "Immigration Attorney", languages: ["Bengali", "English"], specialty: "Asylum, Green Card, Deportation Defense", price: "$150–$350/hr", rating: 4.9, location: "Astoria, Queens", phone: "+1 (718) 555-0400", available: true },
  { id: 3, name: "CUNY Citizenship Now!", type: "Immigration Clinic", languages: ["Spanish", "Bengali", "Chinese", "English"], specialty: "Citizenship, Green Card, DACA", price: "Free", rating: 4.7, location: "Multiple Locations, NYC", phone: "+1 (646) 664-9350", available: true },
  { id: 4, name: "Immigration Equality", type: "LGBTQ+ Legal Aid", languages: ["English", "Spanish"], specialty: "LGBTQ+ asylum, family petitions", price: "Free for low income", rating: 4.8, location: "New York, NY", phone: "+1 (212) 714-2904", available: false },
];

const legalChecklist = [
  { category: "Before Your Appointment", items: ["Your passport and I-94 record", "All visa documents and stamps", "Any USCIS notices or receipt numbers", "Letters from your employer (if applicable)", "Personal statement of your situation"] },
  { category: "For Asylum Seekers", items: ["Evidence of persecution from your country", "Police reports, medical records, news articles", "Witness statements from your home country", "Photos or any physical evidence"] },
];

export function LegalHelp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("directory");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-cyan-600" />
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Legal Help</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Free and low-cost immigration legal resources near you</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">Important: Community members may share experiences, but always verify legal information with a licensed immigration attorney. This platform does not provide legal advice.</p>
          </div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {["directory", "checklist", "q&a"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {tab === "q&a" ? "Q&A" : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {activeTab === "directory" && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search by language, specialty..." className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition" />
              </div>
              {legalResources.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{r.name}</span>
                        <div className={`w-2 h-2 rounded-full ${r.available ? "bg-emerald-500" : "bg-red-400"}`} />
                      </div>
                      <div className="text-xs text-muted-foreground">{r.type}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${r.price === "Free" ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                      {r.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Scale className="w-3 h-3" />{r.specialty}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />{r.location}
                  </div>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {r.languages.map(l => <span key={l} className="text-xs bg-blue-50 text-primary px-2 py-0.5 rounded-full">{l}</span>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{r.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition">
                        <Phone className="w-3 h-3" />Call
                      </button>
                      <button className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 transition">Book Consult</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "checklist" && (
            <div className="space-y-4">
              {legalChecklist.map(section => (
                <div key={section.category} className="bg-white rounded-2xl border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />{section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map(item => (
                      <div key={item} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded border-2 border-border flex items-center justify-center flex-shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "q&a" && (
            <div className="text-center py-8">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-foreground font-medium">Legal Q&A</p>
              <p className="text-xs text-muted-foreground mt-1">Community questions answered by verified attorneys</p>
              <button className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition">Browse Legal Questions</button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Immigration Checklist ───────────────────────────────────────────────────

const checklistItems = [
  { category: "First Week", emoji: "🚀", color: "text-primary bg-blue-50", items: [
    { label: "Get I-94 record from CBP website", done: true },
    { label: "Keep your visa stamp and passport safe", done: true },
    { label: "Note your visa expiration date", done: true },
    { label: "Find your nearest USCIS office", done: false },
  ]},
  { category: "First Month", emoji: "📅", color: "text-emerald-700 bg-emerald-50", items: [
    { label: "Apply for Social Security Number (if eligible)", done: true },
    { label: "Open a bank account", done: true },
    { label: "Find a place to live", done: false },
    { label: "Get health insurance", done: false },
    { label: "Find a primary care doctor", done: false },
    { label: "Register children in school (if applicable)", done: false },
  ]},
  { category: "First 3 Months", emoji: "📋", color: "text-amber-700 bg-amber-50", items: [
    { label: "Get a state ID or driver's license", done: false },
    { label: "File your I-9 with your employer", done: true },
    { label: "Apply for ITIN if you don't have SSN", done: false },
    { label: "File taxes by April deadline", done: false },
  ]},
  { category: "Ongoing", emoji: "🔄", color: "text-purple-700 bg-purple-50", items: [
    { label: "Renew EAD/work permit before expiry", done: false },
    { label: "File annual FBAR if needed", done: false },
    { label: "Update USCIS with address changes (within 10 days)", done: false },
    { label: "Track visa bulletin for priority dates", done: false },
  ]},
];

export function ImmigrationChecklist() {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<string[]>(["Get I-94 record from CBP website", "Keep your visa stamp and passport safe", "Note your visa expiration date", "Apply for Social Security Number (if eligible)", "Open a bank account", "File your I-9 with your employer"]);

  const toggle = (label: string) => {
    setCheckedItems(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);
  };

  const totalItems = checklistItems.reduce((acc, s) => acc + s.items.length, 0);
  const doneItems = checkedItems.length;
  const pct = Math.round((doneItems / totalItems) * 100);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-white border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Settlement Checklist</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Track your progress settling in the USA. Personalized for your visa type.</p>
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{doneItems} of {totalItems} completed</span>
              <span className="text-lg font-bold text-primary">{pct}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {checklistItems.map(section => (
            <div key={section.category} className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className={`px-4 py-2.5 flex items-center gap-2 ${section.color}`}>
                <span>{section.emoji}</span>
                <span className="text-sm font-semibold">{section.category}</span>
                <span className="ml-auto text-xs">
                  {section.items.filter(i => checkedItems.includes(i.label)).length}/{section.items.length}
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {section.items.map(item => {
                  const done = checkedItems.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      onClick={() => toggle(item.label)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? "bg-primary border-primary" : "border-border"}`}>
                        {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm transition-all ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

