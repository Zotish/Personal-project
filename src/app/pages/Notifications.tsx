import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Bell, Heart, MessageCircle, Users, MapPin, Calendar,
  AlertTriangle, Scale, CheckCircle, Repeat2, User, Sparkles
} from "lucide-react";

interface NotificationItem {
  id: number;
  type: "emergency" | "follow" | "reply" | "like" | "community" | "service" | "event" | "repost" | "legal";
  icon: any;
  iconColor: string;
  bg: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  action?: string;
  targetUrl?: string;
  hasUserAvatar?: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "emergency",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    bg: "bg-red-50",
    title: "USCIS Emergency Alert",
    desc: "USCIS has announced a 90-day automatic extension for expiring EAD cards. Check your case status now.",
    time: "2 hours ago",
    read: false,
    action: "View Alert",
    targetUrl: "/services/checklist",
    hasUserAvatar: false,
  },
  {
    id: 2,
    type: "follow",
    icon: Users,
    iconColor: "text-[#C04A22]",
    bg: "bg-[#C04A22]/10",
    title: "Nadia Islam started following you",
    desc: "Immigration attorney · 14.8K followers",
    time: "4 hours ago",
    read: false,
    action: "Follow back",
    targetUrl: "/profile/nadia_islam_nyc",
    hasUserAvatar: true,
  },
  {
    id: 3,
    type: "reply",
    icon: MessageCircle,
    iconColor: "text-[#C04A22]",
    bg: "bg-[#C04A22]/10",
    title: "Carlos Rivera replied to your post",
    desc: '"Great tip about the DMV in Jamaica! I\'ll share this with my Houston friends too 🙌"',
    time: "5 hours ago",
    read: false,
    action: "View reply",
    targetUrl: "/post/1",
    hasUserAvatar: true,
  },
  {
    id: 4,
    type: "like",
    icon: Heart,
    iconColor: "text-rose-500",
    bg: "bg-rose-50",
    title: "47 people liked your post",
    desc: "\"Has anyone applied for NY state ID without SSN?\" — Your post is getting attention!",
    time: "6 hours ago",
    read: true,
    action: "View post",
    targetUrl: "/post/1",
    hasUserAvatar: false,
  },
  {
    id: 5,
    type: "community",
    icon: Users,
    iconColor: "text-[#C04A22]",
    bg: "bg-[#C04A22]/10",
    title: "Community invite: Bangladeshi New Yorkers",
    desc: "Rahim Chowdhury invited you to join this community (14.2K members)",
    time: "8 hours ago",
    read: true,
    action: "Join",
    targetUrl: "/communities",
    hasUserAvatar: true,
  },
  {
    id: 6,
    type: "service",
    icon: MapPin,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "New service near you",
    desc: "Queens Legal Services now offers Bengali language consultations every Tuesday",
    time: "1 day ago",
    read: true,
    action: "View",
    targetUrl: "/services/legal",
    hasUserAvatar: false,
  },
  {
    id: 7,
    type: "event",
    icon: Calendar,
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    title: "Event reminder: Immigration Q&A Tonight",
    desc: "Community legal webinar starts in 3 hours. You registered on Oct 12.",
    time: "1 day ago",
    read: true,
    action: "Join event",
    targetUrl: "/feed",
    hasUserAvatar: false,
  },
  {
    id: 8,
    type: "repost",
    icon: Repeat2,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Your post was reposted 89 times",
    desc: '"Need help finding 2BR apartment in Bronx" — Many people are sharing your request',
    time: "2 days ago",
    read: true,
    action: "View",
    targetUrl: "/profile",
    hasUserAvatar: false,
  },
  {
    id: 9,
    type: "legal",
    icon: Scale,
    iconColor: "text-[#C04A22]",
    bg: "bg-[#C04A22]/10",
    title: "Legal update you should know about",
    desc: "New USCIS policy on H-1B transfers: What it means for workers changing employers",
    time: "2 days ago",
    read: true,
    action: "Read more",
    targetUrl: "/services/legal",
    hasUserAvatar: false,
  },
  {
    id: 10,
    type: "like",
    icon: Heart,
    iconColor: "text-rose-500",
    bg: "bg-rose-50",
    title: "Priya Sharma liked your comment",
    desc: "On post: \"Tips for finding immigrant-friendly healthcare in NYC\"",
    time: "3 days ago",
    read: true,
    action: "View",
    targetUrl: "/profile/priya_sharma_usa",
    hasUserAvatar: true,
  },
];

export function Notifications() {
  const navigate = useNavigate();
  const [notifList, setNotifList] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "mentions">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAllRead = () => {
    setNotifList(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  const unreadCount = notifList.filter(n => !n.read).length;
  const displayed = activeTab === "unread" ? notifList.filter(n => !n.read) : notifList;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto min-h-screen bg-white border-x border-border/80 pb-20 shadow-xs relative">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-fadeIn border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-[#C04A22]" /> {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-800" />
              <h1 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="w-5.5 h-5.5 rounded-full bg-[#C04A22] text-white text-xs flex items-center justify-center font-bold shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#C04A22] font-bold hover:text-[#8C3015] hover:underline cursor-pointer transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: "Unread" },
              { id: "mentions", label: "Mentions" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-border/80">
          {displayed.map(notif => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.targetUrl) navigate(notif.targetUrl);
                }}
                className={`flex gap-3.5 p-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                  !notif.read ? "bg-[#C04A22]/5" : ""
                }`}
              >
                {/* Avatar / Icon Container */}
                <div className="flex-shrink-0">
                  {notif.hasUserAvatar ? (
                    <div className="relative">
                      {/* Normal Default User Avatar Icon (No colored letter badges) */}
                      <div className="w-11 h-11 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs">
                        <User className="w-5.5 h-5.5 text-slate-500" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${notif.bg} border-2 border-white flex items-center justify-center shadow-xs`}>
                        <Icon className={`w-3 h-3 ${notif.iconColor}`} />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-11 h-11 rounded-full ${notif.bg} flex items-center justify-center border border-slate-200/50 shadow-2xs`}>
                      <Icon className={`w-5 h-5 ${notif.iconColor}`} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-900 leading-snug">
                      <span className="font-bold">{notif.title}</span>
                    </p>
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C04A22] flex-shrink-0 mt-1 shadow-2xs" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {notif.desc}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                    {notif.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notif.targetUrl) navigate(notif.targetUrl);
                        }}
                        className="text-xs text-[#C04A22] font-bold hover:text-[#8C3015] hover:underline cursor-pointer"
                      >
                        {notif.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {displayed.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-40" />
            <p className="text-slate-700 font-bold text-sm">No unread notifications</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
