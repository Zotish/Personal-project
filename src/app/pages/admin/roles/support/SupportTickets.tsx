import React, { useState } from "react";
import {
  Headphones, MessageSquare, Clock, CheckCircle2, AlertCircle,
  Search, Filter, Send, User, ChevronRight, X, Sparkles, Shield
} from "lucide-react";

interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userLang: "Bengali" | "English" | "Bilingual";
  category: "Account Recovery" | "Marketplace Order" | "Verification Issue" | "Map & Discovery" | "General Help";
  subject: string;
  message: string;
  priority: "urgent" | "high" | "normal" | "low";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  createdAt: string;
  repliesCount: number;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TCK-8821",
    userName: "Mohammad Faruk",
    userEmail: "faruk.ny@gmail.com",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    userLang: "Bengali",
    category: "Account Recovery",
    subject: "Phone number changed, cannot receive SMS 2FA code",
    message: "Ami amar puraton US phone number ta change korechi. Ekhon login korar shomoy puraton number a code jacche. Amar account a access dorkar, amar immigration lawyer er message ache inbox a.",
    priority: "urgent",
    status: "open",
    assignedTo: "Me",
    createdAt: "14 mins ago",
    repliesCount: 0,
  },
  {
    id: "TCK-8819",
    userName: "Nusrat Jahan",
    userEmail: "nusrat.jahan@outlook.com",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    userLang: "English",
    category: "Verification Issue",
    subject: "Immigration Consultant Bar ID verification document upload failed",
    message: "I tried uploading my New York State Bar association admission certificate in PDF format (4.2MB), but the verification portal timed out. Can you please check if it reached your backend?",
    priority: "high",
    status: "in_progress",
    assignedTo: "Me",
    createdAt: "1 hour ago",
    repliesCount: 2,
  },
  {
    id: "TCK-8812",
    userName: "Kamal Hossain",
    userEmail: "kamal.h@yahoo.com",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    userLang: "Bilingual",
    category: "Marketplace Order",
    subject: "Seller did not arrive at Jackson Heights safe pickup zone",
    message: "I placed an order for fresh Hilsha fish from Bangla Supermarket yesterday. We agreed to meet at the 73rd St Safe Zone at 4 PM, but the seller didn't show up. Need refund.",
    priority: "normal",
    status: "open",
    assignedTo: "Support Pool",
    createdAt: "3 hours ago",
    repliesCount: 1,
  },
  {
    id: "TCK-8798",
    userName: "Sharmin Sultana",
    userEmail: "sharmin.sultana@gmail.com",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    userLang: "Bengali",
    category: "Map & Discovery",
    subject: "Elmhurst Halal Grocery marker is placed on the wrong block",
    message: "Map a Elmhurst Halal Grocery ta Broadway er upor dekhacche, kintu actual dokan ta 82nd street er corner a. Please map coordinates update korun.",
    priority: "low",
    status: "resolved",
    assignedTo: "Tanvir Rahman",
    createdAt: "1 day ago",
    repliesCount: 3,
  },
];

const CANNED_RESPONSES = [
  {
    title: "Password & 2FA Reset Link",
    text: "Hello, we have verified your identity and sent a secure one-time 2FA bypass and phone number update link to your primary email address. Please follow the instructions within 15 minutes.",
  },
  {
    title: "Document Re-upload Requested",
    text: "Thank you for reaching out. We have refreshed your verification portal session. Please re-upload your PDF credential document (under 10MB) directly from your Account Settings > Verification tab.",
  },
  {
    title: "Marketplace Refund Issued",
    text: "We apologize for the inconvenience. As the seller did not show up at the designated Safe Trade Zone, we have cancelled the escrow hold and issued a full refund to your original payment method.",
  },
];

export function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "in_progress",
            repliesCount: t.repliesCount + 1,
          };
        }
        return t;
      })
    );

    setFeedback(`Reply dispatched to ${activeTicket.userName} (${activeTicket.userEmail})`);
    setReplyText("");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleResolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: "resolved" } : t))
    );
    if (activeTicket?.id === id) {
      setActiveTicket(prev => prev ? { ...prev, status: "resolved" } : null);
    }
    setFeedback(`Ticket ${id} marked as Resolved.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-cyan-700 font-bold tracking-wider">
            Customer Care & Member Assistance
          </span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Support Tickets & Helpdesk Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve member inquiries, provide bilingual English/Bengali guidance, and troubleshoot account problems.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Avg Response: 18 mins</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}><X className="w-3.5 h-3.5 text-cyan-700" /></button>
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
            placeholder="Search tickets by ID, name, or keywords..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["all", "open", "in_progress", "resolved"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st
                  ? "bg-cyan-50 text-cyan-800 border border-cyan-300 font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Ticket List + Reply Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className={`${activeTicket ? "lg:col-span-6" : "lg:col-span-12"} space-y-3`}>
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setActiveTicket(ticket)}
              className={`bg-white border rounded-2xl p-4 cursor-pointer transition shadow-xs ${
                activeTicket?.id === ticket.id
                  ? "border-cyan-500 bg-cyan-50/40 ring-2 ring-cyan-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {ticket.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    ticket.priority === "urgent"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : ticket.priority === "high"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {ticket.category}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  ticket.status === "open"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : ticket.status === "in_progress"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{ticket.subject}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{ticket.message}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <img src={ticket.userAvatar} alt={ticket.userName} className="w-5 h-5 rounded-full object-cover shadow-2xs" />
                  <span className="font-semibold text-slate-800">{ticket.userName}</span>
                  <span className="text-slate-400">({ticket.userLang})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-500">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    {ticket.repliesCount}
                  </span>
                  <span>{ticket.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply & Inspection Panel */}
        {activeTicket && (
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img src={activeTicket.userAvatar} alt={activeTicket.userName} className="w-8 h-8 rounded-full object-cover shadow-2xs" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeTicket.userName}</h3>
                  <div className="text-[11px] text-slate-500">{activeTicket.userEmail} • Lang: {activeTicket.userLang}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeTicket.status !== "resolved" && (
                  <button
                    onClick={() => handleResolveTicket(activeTicket.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTicket(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ticket Query Content */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{activeTicket.subject}</span>
                <span className="text-[10px] text-slate-400">{activeTicket.createdAt}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeTicket.message}</p>
            </div>

            {/* Canned Quick Responses */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 mb-1.5 block">Quick Canned Templates:</span>
              <div className="flex flex-wrap gap-1.5">
                {CANNED_RESPONSES.map((cr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyText(cr.text)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 text-left"
                  >
                    {cr.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <div className="relative">
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Write your response to ${activeTicket.userName}... (English or Bengali supported)`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={e => setIsInternalNote(e.target.checked)}
                    className="rounded text-cyan-600 bg-slate-50 border-slate-300"
                  />
                  <span>Internal agent note only</span>
                </label>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-xs shadow-cyan-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Ticket Reply</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
