import { useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { Bell, Heart, MessageCircle, Users, MapPin, Calendar, AlertTriangle, Scale, CheckCircle, Repeat2 } from "lucide-react";

const notifications = [
  { id: 1, type: "emergency", icon: AlertTriangle, iconColor: "text-red-500", bg: "bg-red-50", title: "USCIS Emergency Alert", desc: "USCIS has announced a 90-day automatic extension for expiring EAD cards. Check your case status now.", time: "2 hours ago", read: false, action: "View Alert" },
  { id: 2, type: "follow", icon: Users, iconColor: "text-primary", bg: "bg-blue-50", title: "Nadia Islam started following you", desc: "Immigration attorney · 12.4K followers", time: "4 hours ago", read: false, action: "Follow back", avatar: "NI", avatarColor: "from-emerald-400 to-teal-500" },
  { id: 3, type: "reply", icon: MessageCircle, iconColor: "text-purple-500", bg: "bg-purple-50", title: "Carlos Rivera replied to your post", desc: '"Great tip about the DMV in Jamaica! I\'ll share this with my Houston friends too 🙌"', time: "5 hours ago", read: false, action: "View reply", avatar: "CR", avatarColor: "from-orange-400 to-rose-400" },
  { id: 4, type: "like", icon: Heart, iconColor: "text-red-500", bg: "bg-red-50", title: "47 people liked your post", desc: "\"Has anyone applied for NY state ID without SSN?\" — Your post is getting attention!", time: "6 hours ago", read: true, action: "View post" },
  { id: 5, type: "community", icon: Users, iconColor: "text-primary", bg: "bg-blue-50", title: "Community invite: Bangladeshi New Yorkers", desc: "Rahim Chowdhury invited you to join this community (14.2K members)", time: "8 hours ago", read: true, action: "Join", avatar: "RC", avatarColor: "from-green-400 to-emerald-500" },
  { id: 6, type: "service", icon: MapPin, iconColor: "text-emerald-600", bg: "bg-emerald-50", title: "New service near you", desc: "Queens Legal Services now offers Bengali language consultations every Tuesday", time: "1 day ago", read: true, action: "View" },
  { id: 7, type: "event", icon: Calendar, iconColor: "text-amber-500", bg: "bg-amber-50", title: "Event reminder: Immigration Q&A Tonight", desc: "Community legal webinar starts in 3 hours. You registered on Oct 12.", time: "1 day ago", read: true, action: "Join event" },
  { id: 8, type: "repost", icon: Repeat2, iconColor: "text-emerald-600", bg: "bg-emerald-50", title: "Your post was reposted 89 times", desc: '"Need help finding 2BR apartment in Bronx" — Many people are sharing your request', time: "2 days ago", read: true, action: "View" },
  { id: 9, type: "legal", icon: Scale, iconColor: "text-indigo-500", bg: "bg-indigo-50", title: "Legal update you should know about", desc: "New USCIS policy on H-1B transfers: What it means for workers changing employers", time: "2 days ago", read: true, action: "Read more" },
  { id: 10, type: "like", icon: Heart, iconColor: "text-red-500", bg: "bg-red-50", title: "Dr. Priya Menon liked your comment", desc: "On post: \"Tips for finding immigrant-friendly healthcare\"", time: "3 days ago", read: true, action: "View", avatar: "PM", avatarColor: "from-purple-400 to-indigo-500" },
];

export function Notifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [readAll, setReadAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = activeTab === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-foreground" />
              <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Notifications</h1>
              {unreadCount > 0 && (
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </div>
            <button
              onClick={() => setReadAll(true)}
              className="text-xs text-primary font-medium hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            {["all", "unread", "mentions"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {displayed.map(notif => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`flex gap-3 p-4 transition-colors hover:bg-secondary/50 cursor-pointer ${!notif.read && !readAll ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex-shrink-0">
                  {notif.avatar ? (
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${notif.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                        {notif.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${notif.bg} border-2 border-white flex items-center justify-center`}>
                        <Icon className={`w-3 h-3 ${notif.iconColor}`} />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-11 h-11 rounded-full ${notif.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${notif.iconColor}`} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground leading-snug">
                      <span className="font-semibold">{notif.title}</span>
                    </p>
                    {!notif.read && !readAll && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                    {notif.action && (
                      <button className="text-xs text-primary font-semibold hover:underline">{notif.action}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayed.length === 0 && (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-foreground font-medium">No unread notifications</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
