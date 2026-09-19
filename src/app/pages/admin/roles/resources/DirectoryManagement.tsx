import React, { useState } from "react";
import {
  MapPin, Plus, Search, Filter, Edit3, Trash2, CheckCircle2,
  AlertCircle, ExternalLink, RefreshCw, X, Building2, Phone, Clock
} from "lucide-react";

interface CivicPlace {
  id: string;
  name: string;
  category: "Healthcare" | "Religious & Community" | "Food Assistance" | "Legal Services" | "Civic & Consular";
  address: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  phone: string;
  hours: string;
  isVerified: boolean;
  status: "active" | "draft" | "under_review";
  updatedAt: string;
}

const INITIAL_PLACES: CivicPlace[] = [
  {
    id: "DIR-001",
    name: "Elmhurst Hospital Center (NYC Health + Hospitals)",
    category: "Healthcare",
    address: "79-01 Broadway, Elmhurst, NY 11373",
    city: "Queens, NY",
    coordinates: [40.7447, -73.8856],
    phone: "+1 (718) 334-4000",
    hours: "24/7 Emergency & Sliding Scale Clinic",
    isVerified: true,
    status: "active",
    updatedAt: "Yesterday",
  },
  {
    id: "DIR-002",
    name: "Jackson Heights Islamic Center (Baitul Hamd)",
    category: "Religious & Community",
    address: "37-46 72nd St, Jackson Heights, NY 11372",
    city: "Queens, NY",
    coordinates: [40.7489, -73.8924],
    phone: "+1 (718) 424-9121",
    hours: "5:00 AM - 10:00 PM Daily",
    isVerified: true,
    status: "active",
    updatedAt: "2 days ago",
  },
  {
    id: "DIR-003",
    name: "DRUM (Desis Rising Up & Moving) Community Hub",
    category: "Legal Services",
    address: "72-18 Roosevelt Ave, Jackson Heights, NY 11372",
    city: "Queens, NY",
    coordinates: [40.7468, -73.8911],
    phone: "+1 (718) 205-3036",
    hours: "Mon-Fri 10:00 AM - 6:00 PM",
    isVerified: true,
    status: "active",
    updatedAt: "3 days ago",
  },
  {
    id: "DIR-004",
    name: "City Harvest Mobile Food Market - Queens",
    category: "Food Assistance",
    address: "Queensbridge Houses, 10-06 41st Ave, Long Island City, NY",
    city: "Queens, NY",
    coordinates: [40.7554, -73.9431],
    phone: "+1 (646) 412-0600",
    hours: "Bi-weekly Saturdays 9:30 AM - 11:30 AM",
    isVerified: false,
    status: "under_review",
    updatedAt: "4 days ago",
  },
  {
    id: "DIR-005",
    name: "Bangladesh Consulate General in New York",
    category: "Civic & Consular",
    address: "34-18 Northern Blvd, Long Island City, NY 11101",
    city: "Queens, NY",
    coordinates: [40.7516, -73.9288],
    phone: "+1 (212) 233-6777",
    hours: "Mon-Fri 9:30 AM - 4:00 PM (Passport & NID)",
    isVerified: true,
    status: "active",
    updatedAt: "1 week ago",
  },
];

export function DirectoryManagement() {
  const [places, setPlaces] = useState<CivicPlace[]>(INITIAL_PLACES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New place form state
  const [newPlace, setNewPlace] = useState({
    name: "",
    category: "Healthcare" as CivicPlace["category"],
    address: "",
    city: "Queens, NY",
    lat: "40.7500",
    lng: "-73.8900",
    phone: "",
    hours: "",
    isVerified: true,
  });

  const categories = [
    "all",
    "Healthcare",
    "Religious & Community",
    "Food Assistance",
    "Legal Services",
    "Civic & Consular",
  ];

  const filteredPlaces = places.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleToggleStatus = (id: string) => {
    setPlaces(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStatus = p.status === "active" ? "draft" : "active";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    setFeedback("Directory listing visibility status updated.");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from civic directory?`)) {
      setPlaces(prev => prev.filter(p => p.id !== id));
      setFeedback(`Removed "${name}" from directory listings.`);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleCreatePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name.trim() || !newPlace.address.trim()) return;

    const created: CivicPlace = {
      id: `DIR-00${places.length + 1}`,
      name: newPlace.name.trim(),
      category: newPlace.category,
      address: newPlace.address.trim(),
      city: newPlace.city.trim(),
      coordinates: [parseFloat(newPlace.lat) || 40.75, parseFloat(newPlace.lng) || -73.89],
      phone: newPlace.phone.trim() || "N/A",
      hours: newPlace.hours.trim() || "Regular hours",
      isVerified: newPlace.isVerified,
      status: "active",
      updatedAt: "Just now",
    };

    setPlaces(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewPlace({
      name: "",
      category: "Healthcare",
      address: "",
      city: "Queens, NY",
      lat: "40.7500",
      lng: "-73.8900",
      phone: "",
      hours: "",
      isVerified: true,
    });
    setFeedback(`Successfully created directory listing: "${created.name}"`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-amber-700 font-bold tracking-wider">
            Directory & Civic Infrastructure
          </span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Civic Places & Resource Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curate essential diaspora community points of interest (hospitals, legal aid, mosques, food pantries) for map discovery.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFeedback("Synchronizing POIs with BariKoi & OpenStreetMap Geocoding cache...");
              setTimeout(() => setFeedback("Directory geocoding cache is fully up to date!"), 1200);
              setTimeout(() => setFeedback(null), 4000);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Sync Geocache</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Civic Place</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5 text-amber-700" /></button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search places by name or address..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-amber-50 text-amber-800 border border-amber-300 font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPlaces.map(place => (
          <div
            key={place.id}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {place.id}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {place.category}
                </span>
                {place.isVerified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Civic Resource
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    place.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {place.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  {place.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {place.address}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    [{place.coordinates[0].toFixed(4)}, {place.coordinates[1].toFixed(4)}]
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {place.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {place.hours}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Updated {place.updatedAt}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end lg:self-center">
              <button
                onClick={() => handleToggleStatus(place.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  place.status === "active"
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                {place.status === "active" ? "Set to Draft" : "Publish"}
              </button>
              <button
                onClick={() => handleDelete(place.id, place.name)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Civic Place Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Civic Resource</h3>
                <p className="text-xs text-slate-500">Add an immigrant community service location to PathaSathi discovery</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Place / Facility Name</label>
                <input
                  type="text"
                  required
                  value={newPlace.name}
                  onChange={e => setNewPlace({ ...newPlace, name: e.target.value })}
                  placeholder="e.g. Jamaica Hospital Medical Center"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newPlace.category}
                    onChange={e => setNewPlace({ ...newPlace, category: e.target.value as CivicPlace["category"] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="Healthcare">Healthcare</option>
                    <option value="Religious & Community">Religious & Community</option>
                    <option value="Food Assistance">Food Assistance</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Civic & Consular">Civic & Consular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Borough / Area</label>
                  <input
                    type="text"
                    value={newPlace.city}
                    onChange={e => setNewPlace({ ...newPlace, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={newPlace.address}
                  onChange={e => setNewPlace({ ...newPlace, address: e.target.value })}
                  placeholder="e.g. 89-00 Van Wyck Expy, Jamaica, NY 11418"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={newPlace.lat}
                    onChange={e => setNewPlace({ ...newPlace, lat: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={newPlace.lng}
                    onChange={e => setNewPlace({ ...newPlace, lng: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPlace.phone}
                    onChange={e => setNewPlace({ ...newPlace, phone: e.target.value })}
                    placeholder="+1 (718) 206-6000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={newPlace.hours}
                    onChange={e => setNewPlace({ ...newPlace, hours: e.target.value })}
                    placeholder="24/7 or 9 AM - 5 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verifyCheckbox"
                  checked={newPlace.isVerified}
                  onChange={e => setNewPlace({ ...newPlace, isVerified: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 bg-slate-50 border-slate-300"
                />
                <label htmlFor="verifyCheckbox" className="text-xs text-slate-700">
                  Mark as verified official community resource
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs shadow-amber-500/20"
                >
                  Save Place Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
