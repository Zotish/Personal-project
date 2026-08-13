import { useState } from "react";
import { useSearchParams } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, Send, Paperclip, Mic, Languages, MoreHorizontal,
  ShieldAlert, ChevronLeft, Phone, Video, CheckCheck, AlertTriangle, Image
} from "lucide-react";

const conversations = [
  { id: 1, name: "Nadia Islam", handle: "@nadia_nyc", avatar: "NI", color: "from-emerald-400 to-teal-500", lastMsg: "Yes, I can help you with your I-485 application. Please send me...", time: "2m", unread: 2, online: true },
  { id: 2, name: "Carlos Rivera", handle: "@carlos_helps", avatar: "CR", color: "from-orange-400 to-rose-400", lastMsg: "The housing application requires the following documents...", time: "1h", unread: 0, online: false },
  { id: 3, name: "Dr. Priya Menon", handle: "@dr_priya_health", avatar: "PM", color: "from-purple-400 to-indigo-500", lastMsg: "For your insurance question, you need to contact...", time: "3h", unread: 0, online: true },
  { id: 4, name: "Rahim Chowdhury", handle: "@rahim_bdconnect", avatar: "RC", color: "from-green-400 to-emerald-500", lastMsg: "Ami ektu pore call korbo. Community meeting ace.", time: "5h", unread: 0, online: false },
  { id: 5, name: "Maria Santos", handle: "@maria_studentlife", avatar: "MS", color: "from-pink-400 to-rose-500", lastMsg: "Your OPT application should be submitted 90 days before...", time: "1d", unread: 0, online: false },
];

const messages = [
  { id: 1, from: "them", text: "Hello! I saw your question in the community about I-485. I'm an immigration attorney and can help you understand the process.", time: "10:32 AM", read: true },
  { id: 2, from: "me", text: "Oh thank you so much! I wasn't sure where to start. I have my green card application pending but I don't understand the timeline.", time: "10:35 AM", read: true },
  { id: 3, from: "them", text: "I understand how overwhelming it can be. The I-485 (Adjustment of Status) typically takes 8-24 months depending on your priority date and visa category. What's your current visa type?", time: "10:37 AM", read: true },
  { id: 4, from: "me", text: "I'm on H-1B. My employer filed I-140 which was approved. Now I'm waiting for I-485.", time: "10:40 AM", read: true },
  { id: 5, from: "them", text: "Perfect. For EB-2/EB-3 categories from Bangladesh, there's currently a significant backlog. But while waiting, you can file for:\n• I-131 (Travel document)\n• I-765 (Work authorization renewal)\n\nThis will keep your status valid.", time: "10:42 AM", read: true },
  { id: 6, from: "them", text: "Also, once your priority date becomes current on the Visa Bulletin, we need to act quickly. Would you like me to set up a free 30-minute consultation call?", time: "10:43 AM", read: true },
  { id: 7, from: "me", text: "Yes please! That would be incredibly helpful. When are you available?", time: "10:45 AM", read: false },
];

function InboxList({ onSelect, selected }: { onSelect: (id: number) => void; selected: number | null }) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 p-4 text-left hover:bg-secondary transition-colors border-b border-border/50 ${selected === conv.id ? "bg-blue-50" : ""}`}
          >
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white text-sm font-bold`}>
                {conv.avatar}
              </div>
              {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{conv.name}</span>
                <span className="text-xs text-muted-foreground">{conv.time}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-muted-foreground truncate flex-1 mr-2">{conv.lastMsg}</span>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{conv.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ convId, onBack }: { convId: number; onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const conv = conversations.find(c => c.id === convId)!;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-white">
        <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-secondary text-foreground transition-colors flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white text-sm font-bold`}>
            {conv.avatar}
          </div>
          {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{conv.name}</div>
          <div className="text-xs text-muted-foreground">{conv.online ? "Online now" : "Last seen 5h ago"}</div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"><Phone className="w-4 h-4" /></button>
          <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"><Video className="w-4 h-4" /></button>
          <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Safety warning for unknown users */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">Never share personal documents or send money to people you haven't verified.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        <div className="text-center">
          <span className="text-xs text-muted-foreground bg-white px-3 py-1 rounded-full border border-border">Today</span>
        </div>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              msg.from === "me"
                ? "bg-primary text-white rounded-br-sm"
                : "bg-white border border-border text-foreground rounded-bl-sm"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.from === "me" ? "justify-end" : ""}`}>
                <span className={`text-xs ${msg.from === "me" ? "text-blue-200" : "text-muted-foreground"}`}>{msg.time}</span>
                {msg.from === "me" && (
                  <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-blue-200" : "text-blue-300/60"}`} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0">
            <Image className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition"
          />
          <button className="p-2 rounded-xl hover:bg-secondary text-primary transition-colors flex-shrink-0" title="Translate">
            <Languages className="w-4 h-4" />
          </button>
          {msg ? (
            <button
              className="p-2.5 rounded-xl text-white flex-shrink-0 hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button className="p-2.5 rounded-xl border border-border text-muted-foreground flex-shrink-0 hover:bg-secondary transition">
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Messages() {
  const [searchParams] = useSearchParams();
  const [selectedConv, setSelectedConv] = useState<number | null>(1);
  const isSeller = searchParams.get("role") === "seller";

  return (
    <AppLayout variant={isSeller ? "seller" : "buyer"} activeTab="messages" noPad hideNav={Boolean(selectedConv)}>
      <div className="flex h-screen max-h-screen overflow-hidden">
        {/* Inbox - always visible on desktop, hidden on mobile when chat is open */}
        <div className={`${selectedConv ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 xl:w-96 border-r border-border bg-white flex-shrink-0`}>
          <InboxList onSelect={setSelectedConv} selected={selectedConv} />
        </div>

        {/* Chat view */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            <ChatScreen convId={selectedConv} onBack={() => setSelectedConv(null)} />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Your Messages</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Select a conversation to start chatting with community members and advisors.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
