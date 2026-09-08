import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Search, Send, Paperclip, Mic, MicOff, Languages, MoreHorizontal,
  ChevronLeft, ChevronDown, Phone, PhoneOff, Video, VideoOff, CheckCheck, Image as ImageIcon,
  User, Volume2, VolumeX, Camera, FileText, Download, Play, Pause,
  BellOff, Pin, Trash2, Flag, UserX, X, Sparkles, File, FileImage,
  Copy, Reply, Share2, CornerUpLeft, MessageSquare, Shield,
  ArrowLeft, MoreVertical, Palette, Bell, ChevronRight, Check, ExternalLink
} from "lucide-react";

interface MessageItem {
  id: number;
  from: "me" | "them";
  text?: string;
  type?: "text" | "image" | "file" | "voice" | "call_log";
  fileName?: string;
  fileSize?: string;
  imageUrl?: string;
  duration?: string;
  time: string;
  read: boolean;
  translatedText?: string;
  isManuallyTranslated?: boolean;
  reactions?: { [emoji: string]: number };
  isPinned?: boolean;
  replyToText?: string;
  replyToSender?: string;
}

export interface ConversationItem {
  id: number;
  name: string;
  handle: string;
  bio?: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

const initialConversations: ConversationItem[] = [
  {
    id: 1,
    name: "Nadia Islam, Esq.",
    handle: "@nadia_islam_nyc",
    bio: "Immigration Attorney & Community Legal Advisor",
    lastMsg: "Yes, I can help you with your I-485 application. Please send me...",
    time: "2m",
    unread: 2,
    online: true,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Carlos Rivera",
    handle: "@carlos_helps",
    bio: "Community Housing Coordinator",
    lastMsg: "The housing application requires the following documents...",
    time: "1h",
    unread: 0,
    online: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Dr. Priya Menon",
    handle: "@dr_priya_health",
    bio: "Healthcare Specialist & Advisor",
    lastMsg: "For your insurance question, you need to contact...",
    time: "3h",
    unread: 0,
    online: true,
    avatar: "https://images.unsplash.com/photo-1594824813637-44f2ff5b4e34?w=400&h=400&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Rahim Chowdhury",
    handle: "@rahim_bdconnect",
    bio: "Community Leader & Event Organizer",
    lastMsg: "Ami ektu pore call korbo. Community meeting ace.",
    time: "5h",
    unread: 0,
    online: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Maria Santos",
    handle: "@maria_studentlife",
    bio: "International Student Advisor",
    lastMsg: "Your OPT application should be submitted 90 days before...",
    time: "1d",
    unread: 0,
    online: false,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face"
  },
];

const initialMessages: MessageItem[] = [
  { id: 1, from: "them", text: "Hello! I saw your question in the community about I-485. I'm an immigration attorney and can help you understand the process.", translatedText: "হ্যালো! আমি কমিউনিটিতে আপনার I-485 সম্পর্কে প্রশ্নটি দেখেছি। আমি একজন ইমিগ্রেশন অ্যাটর্নি এবং আপনাকে প্রক্রিয়াটি বুঝতে সাহায্য করতে পারি।", time: "10:32 AM", read: true },
  { id: 2, from: "me", text: "Oh thank you so much! I wasn't sure where to start. I have my green card application pending but I don't understand the timeline.", time: "10:35 AM", read: true },
  { id: 3, from: "them", text: "I understand how overwhelming it can be. The I-485 (Adjustment of Status) typically takes 8-24 months depending on your priority date and visa category. What's your current visa type?", translatedText: "আমি বুঝতে পারছি এটা কতটা কঠিন মনে হতে পারে। I-485 (অ্যাডজাস্টমেন্ট অফ স্ট্যাটাস) সাধারণত আপনার প্রায়োরিটি তারিখ এবং ভিসা ক্যাটাগরির ওপর ভিত্তি করে ৮-২৪ মাস সময় নেয়। আপনার বর্তমান ভিসার ধরন কী?", time: "10:37 AM", read: true },
  { id: 4, from: "me", text: "I'm on H-1B. My employer filed I-140 which was approved. Now I'm waiting for I-485.", time: "10:40 AM", read: true },
  { id: 5, from: "them", text: "Perfect. For EB-2/EB-3 categories from Bangladesh, there's currently a backlog. But while waiting, you can file for:\n• I-131 (Travel document)\n• I-765 (Work authorization renewal)\n\nThis will keep your status valid.", translatedText: "দারুণ। বাংলাদেশের জন্য EB-2/EB-3 ক্যাটাগরিতে বর্তমানে ব্যাকলগ রয়েছে। তবে অপেক্ষার সময় আপনি এই আবেদনগুলো করতে পারেন:\n• I-131 (ভ্রমণ নথি)\n• I-765 (ওয়ার্ক পারমিট রিনিউয়াল)", time: "10:42 AM", read: true },
  { id: 6, from: "them", text: "Also, once your priority date becomes current on the Visa Bulletin, we need to act quickly. Would you like me to set up a free 30-minute consultation call?", translatedText: "এছাড়াও, আপনার প্রায়োরিটি তারিখ ভিসা বুলেটিনে কারেন্ট হওয়ার সাথে সাথে আমাদের দ্রুত পদক্ষেপ নিতে হবে। আপনি কি একটি ফ্রি ৩০ মিনিটের কনসালটেশন কল করতে চান?", time: "10:43 AM", read: true },
  { id: 7, from: "me", text: "Yes please! That would be incredibly helpful. When are you available?", time: "10:45 AM", read: false },
];

function InboxList({
  conversations,
  onSelect,
  selected,
  pinnedIds
}: {
  conversations: ConversationItem[];
  onSelect: (id: number) => void;
  selected: number | null;
  pinnedIds: number[];
}) {
  const [search, setSearch] = useState("");

  const filteredConversations = conversations
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.lastMsg.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (pinnedIds.includes(b.id) ? 1 : 0) - (pinnedIds.includes(a.id) ? 1 : 0));

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
            className="w-full pl-10 pr-4 py-2 bg-input-background rounded-xl border border-border text-sm focus:outline-none focus:ring-1 focus:ring-[#C04A22] focus:border-[#C04A22] transition"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map(conv => {
          const isPinned = pinnedIds.includes(conv.id);
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-4 text-left transition-all border-b border-border/50 cursor-pointer ${selected === conv.id ? "bg-[#C04A22]/15" : "hover:bg-slate-50"
                }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs overflow-hidden">
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5.5 h-5.5 text-slate-500" />
                  )}
                </div>
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{conv.name}</span>
                    {isPinned && <Pin className="w-3 h-3 text-[#C04A22] flex-shrink-0" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-muted-foreground truncate flex-1 mr-2">{conv.lastMsg}</span>
                  {conv.unread > 0 && (
                    <span className="w-5.5 h-5.5 rounded-full bg-[#C04A22]/15 text-[#8C3015] border border-[#C04A22]/30 text-xs flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatScreen({
  convId,
  conversations,
  onBack,
  pinnedIds,
  onTogglePin
}: {
  convId: number;
  conversations: ConversationItem[];
  onBack: () => void;
  pinnedIds: number[];
  onTogglePin: (id: number) => void;
}) {
  const navigate = useNavigate();
  const conv = conversations.find(c => c.id === convId) || {
    id: convId,
    name: "User",
    handle: "@user",
    bio: "Community Member",
    lastMsg: "",
    time: "now",
    unread: 0,
    online: true,
  };
  const [messagesList, setMessagesList] = useState<MessageItem[]>(initialMessages);
  const [inputText, setInputText] = useState("");

  // Feature states
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCallingAudio, setIsCallingAudio] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const [isCallingVideo, setIsCallingVideo] = useState(false);
  const [videoCamOff, setVideoCamOff] = useState(false);
  const [videoMicOff, setVideoMicOff] = useState(false);

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioUrlRef = useRef<string | null>(null);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [inChatSearch, setInChatSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Messenger-Style Contact Details / Profile View States
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [contactNickname, setContactNickname] = useState<string>("");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [showMediaFilesModal, setShowMediaFilesModal] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"media" | "files" | "links">("media");
  const [chatThemeColor, setChatThemeColor] = useState<string>("#C04A22");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showContactMoreMenu, setShowContactMoreMenu] = useState(false);

  const handleOpenUserProfile = () => {
    const handleClean = (conv.handle || conv.name).replace('@', '').toLowerCase().replace(/\s+/g, '_');
    navigate(`/profile/${handleClean}`);
  };

  // WhatsApp-style Message Options Popup State
  const [selectedMsgForAction, setSelectedMsgForAction] = useState<MessageItem | null>(null);
  const [replyingToMsg, setReplyingToMsg] = useState<MessageItem | null>(null);
  const [showForwardModal, setShowForwardModal] = useState<MessageItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPinned = pinnedIds.includes(convId);

  // Pinned Message in this thread
  const pinnedMessageInThread = messagesList.find(m => m.isPinned);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  // Audio Call duration timer
  useEffect(() => {
    let timer: any;
    if (isCallingAudio || isCallingVideo) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallingAudio, isCallingVideo]);

  // Voice recording lifecycle with microphone recording & simulation fallback
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setRecordTime(t => t + 1), 1000);

      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            try {
              const mr = new (window as any).MediaRecorder(stream);
              mediaRecorderRef.current = mr;
              audioChunksRef.current = [];
              mr.ondataavailable = (e: any) => {
                if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
              };
              mr.start();
            } catch (err) {
              console.warn("MediaRecorder start error:", err);
            }
          })
          .catch(() => {
            // Permission not granted or mic unavailable
          });
      }
    } else {
      setRecordTime(0);
      setIsPlayingRecording(false);
      setPlaybackTime(0);

      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          mediaRecorderRef.current.stream?.getTracks().forEach((track: any) => track.stop());
        } catch (_) {}
        mediaRecorderRef.current = null;
      }
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.pause(); } catch (_) {}
        audioPlayerRef.current = null;
      }
      if (recordedAudioUrlRef.current) {
        try { URL.revokeObjectURL(recordedAudioUrlRef.current); } catch (_) {}
        recordedAudioUrlRef.current = null;
      }
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Voice playback progress timer
  useEffect(() => {
    let timer: any;
    if (isPlayingRecording) {
      timer = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= (recordTime || 1)) {
            setIsPlayingRecording(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingRecording, recordTime]);

  // Listen / Preview Recorded Voice
  const handleToggleListenVoice = () => {
    if (isPlayingRecording) {
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.pause(); } catch (_) {}
      }
      setIsPlayingRecording(false);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.onstop = () => {
          try {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
            if (blob.size > 0) {
              const url = URL.createObjectURL(blob);
              recordedAudioUrlRef.current = url;
              startAudioPlayback(url);
              return;
            }
          } catch (_) {}
          startSimulatedPlayback();
        };
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach((track: any) => track.stop());
      } catch (_) {
        startSimulatedPlayback();
      }
      return;
    }

    if (recordedAudioUrlRef.current) {
      startAudioPlayback(recordedAudioUrlRef.current);
    } else {
      startSimulatedPlayback();
    }
  };

  const startAudioPlayback = (url: string) => {
    try {
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      setIsPlayingRecording(true);
      audio.onended = () => {
        setIsPlayingRecording(false);
        setPlaybackTime(0);
      };
      audio.ontimeupdate = () => {
        setPlaybackTime(Math.floor(audio.currentTime));
      };
      audio.play().catch(() => {
        startSimulatedPlayback();
      });
    } catch (_) {
      startSimulatedPlayback();
    }
  };

  const startSimulatedPlayback = () => {
    setIsPlayingRecording(true);
    setPlaybackTime(0);
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + Math.min(recordTime || 3, 4));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + Math.min(recordTime || 3, 4));
      }
    } catch (_) {}
  };

  const showToast = (msgText: string) => {
    setToastMessage(msgText);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCurrentTimeStr = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send Text Message
  const handleSendText = () => {
    if (!inputText.trim()) return;
    const newMsg: MessageItem = {
      id: Date.now(),
      from: "me",
      text: inputText.trim(),
      type: "text",
      time: getCurrentTimeStr(),
      read: false,
      replyToText: replyingToMsg ? (replyingToMsg.text || replyingToMsg.fileName || "Media") : undefined,
      replyToSender: replyingToMsg ? (replyingToMsg.from === "me" ? "You" : conv.name) : undefined
    };
    setMessagesList(prev => [...prev, newMsg]);
    setInputText("");
    setReplyingToMsg(null);
  };

  // Send File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newMsg: MessageItem = {
      id: Date.now(),
      from: "me",
      type: "file",
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      time: getCurrentTimeStr(),
      read: false,
    };
    setMessagesList(prev => [...prev, newMsg]);
    showToast(`File "${file.name}" attached successfully`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newMsg: MessageItem = {
      id: Date.now(),
      from: "me",
      type: "image",
      imageUrl: url,
      time: getCurrentTimeStr(),
      read: false,
    };
    setMessagesList(prev => [...prev, newMsg]);
    setShowImagePicker(false);
    showToast("Photo sent successfully");
    if (e.target) e.target.value = "";
  };

  // Send Voice Note
  const handleSendVoiceNote = () => {
    const durationStr = `0:${recordTime < 10 ? '0' : ''}${recordTime}`;
    const newMsg: MessageItem = {
      id: Date.now(),
      from: "me",
      type: "voice",
      duration: durationStr || "0:06",
      time: getCurrentTimeStr(),
      read: false,
    };
    setMessagesList(prev => [...prev, newMsg]);
    setIsRecordingVoice(false);
    showToast("Voice message sent");
  };

  // End Audio/Video Call
  const handleEndCall = (callType: "audio" | "video") => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    setIsCallingAudio(false);
    setIsCallingVideo(false);

    const newMsg: MessageItem = {
      id: Date.now(),
      from: "me",
      type: "call_log",
      text: `${callType === "audio" ? "📞 Audio" : "📹 Video"} Call ended · ${durationFormatted}`,
      time: getCurrentTimeStr(),
      read: true,
    };
    setMessagesList(prev => [...prev, newMsg]);
  };

  // WhatsApp Options Actions
  const handleAddReaction = (msgId: number, emoji: string) => {
    setMessagesList(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = { ...(m.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...m, reactions };
      }
      return m;
    }));
    setSelectedMsgForAction(null);
    showToast(`Reacted with ${emoji}`);
  };

  const handleCopyMsgText = (text: string) => {
    navigator.clipboard.writeText(text);
    setSelectedMsgForAction(null);
    showToast("Message text copied to clipboard");
  };

  const handleTogglePinMessage = (msgItem: MessageItem) => {
    const nextState = !msgItem.isPinned;
    setMessagesList(prev => prev.map(m => m.id === msgItem.id ? { ...m, isPinned: nextState } : m));
    setSelectedMsgForAction(null);
    showToast(nextState ? "Message pinned to top of chat" : "Message unpinned");
  };

  const handleTranslateSingleMsg = (msgItem: MessageItem) => {
    setMessagesList(prev => prev.map(m => {
      if (m.id === msgItem.id) {
        const nextState = !m.isManuallyTranslated;
        return {
          ...m,
          isManuallyTranslated: nextState,
          translatedText: m.translatedText || `[বাংলা অনুবাদ]: ${m.text}`
        };
      }
      return m;
    }));
    setSelectedMsgForAction(null);
    showToast("Toggled Bengali translation for message");
  };

  const handleDeleteMsg = (msgId: number) => {
    setMessagesList(prev => prev.filter(m => m.id !== msgId));
    setSelectedMsgForAction(null);
    showToast("Message deleted");
  };

  // Filter messages if search is active
  const displayedMessages = messagesList.filter(m => {
    if (!inChatSearch.trim()) return true;
    return m.text?.toLowerCase().includes(inChatSearch.toLowerCase()) || m.fileName?.toLowerCase().includes(inChatSearch.toLowerCase());
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-background">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-[#C04A22]" /> {toastMessage}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageUpload} className="hidden" />

      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-white z-20">
        <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-secondary text-foreground transition-colors flex items-center justify-center cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative cursor-pointer" onClick={() => setShowContactDetails(true)} title={`View ${conv.name}'s Info`}>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300/60 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-2xs overflow-hidden">
            {conv.avatar ? (
              <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
          {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowContactDetails(true)} title={`View ${conv.name}'s Info`}>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate hover:underline">
              {contactNickname || conv.name}
            </span>
            {isMuted && <BellOff className="w-3.5 h-3.5 text-amber-500" />}
          </div>
          <div className="text-xs text-muted-foreground">{conv.online ? "Online now" : "Last seen 5h ago"}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Audio Call Button */}
          <button
            onClick={() => setIsCallingAudio(true)}
            className="p-2 rounded-xl hover:bg-secondary text-slate-600 hover:text-[#C04A22] transition-colors cursor-pointer active:scale-95"
            title="Start Audio Call"
          >
            <Phone className="w-4.5 h-4.5" />
          </button>

          {/* Video Call Button */}
          <button
            onClick={() => setIsCallingVideo(true)}
            className="p-2 rounded-xl hover:bg-secondary text-slate-600 hover:text-[#C04A22] transition-colors cursor-pointer active:scale-95"
            title="Start Video Call"
          >
            <Video className="w-4.5 h-4.5" />
          </button>

          {/* 3-Dot More Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl hover:bg-secondary text-slate-600 hover:text-[#C04A22] transition-colors cursor-pointer active:scale-95"
              title="More options"
            >
              <MoreHorizontal className="w-4.5 h-4.5" />
            </button>

            {/* 3-Dot Dropdown Popover */}
            {showMoreMenu && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-fadeIn text-xs font-semibold text-slate-700">
                <button
                  onClick={() => { setShowMoreMenu(false); setShowContactDetails(true); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" /> Contact & Chat Info
                </button>
                <button
                  onClick={() => { setShowSearchOverlay(!showSearchOverlay); setShowMoreMenu(false); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-500" /> Search Conversation
                </button>
                <button
                  onClick={() => { onTogglePin(convId); setShowMoreMenu(false); showToast(isPinned ? "Unpinned conversation" : "Pinned conversation to top"); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <Pin className="w-4 h-4 text-slate-500" /> {isPinned ? "Unpin Conversation" : "Pin Conversation"}
                </button>
                <button
                  onClick={() => { setIsMuted(!isMuted); setShowMoreMenu(false); showToast(isMuted ? "Unmuted notifications" : "Notifications muted"); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                >
                  <BellOff className="w-4 h-4 text-slate-500" /> {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => { setMessagesList([]); setShowMoreMenu(false); showToast("Chat history cleared"); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" /> Clear Chat History
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); showToast(`Blocked ${conv.name}`); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                >
                  <UserX className="w-4 h-4 text-red-500" /> Block User
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); showToast("Report submitted to moderation"); }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                >
                  <Flag className="w-4 h-4 text-red-500" /> Report Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Immigrant Safety & Anti-Harassment Firewall Warning */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-[11px] leading-tight">
            <strong>Immigrant Privacy Shield:</strong> Never share your SSN, case/A-number, passport, or home address in chat with strangers.
          </span>
        </div>
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessageInThread && (
        <div className="bg-[#C04A22]/10 border-b border-[#C04A22]/20 px-4 py-2 flex items-center justify-between text-xs text-[#8C3015] font-semibold animate-fadeIn z-10">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
            <span className="truncate">Pinned: {pinnedMessageInThread.text || pinnedMessageInThread.fileName || "Media"}</span>
          </div>
          <button
            onClick={() => handleTogglePinMessage(pinnedMessageInThread)}
            className="text-[10px] text-slate-500 hover:text-red-500 font-bold ml-2 cursor-pointer flex-shrink-0"
          >
            Unpin
          </button>
        </div>
      )}

      {/* In-Chat Search Overlay */}
      {showSearchOverlay && (
        <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex items-center gap-2 z-10 animate-fadeIn">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={inChatSearch}
            onChange={e => setInChatSearch(e.target.value)}
            placeholder="Search words in conversation..."
            className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#C04A22]"
            autoFocus
          />
          <button onClick={() => { setShowSearchOverlay(false); setInChatSearch(""); }} className="p-1 rounded-md text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center mb-2">
          <span className="text-xs text-muted-foreground bg-white px-3 py-1 rounded-full border border-border">Today</span>
        </div>

        {displayedMessages.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-medium">
            No messages found.
          </div>
        ) : (
          displayedMessages.map((msgItem, index) => {
            const isNearBottom = index >= displayedMessages.length - 2;
            return (
              <div key={msgItem.id} className={`flex ${msgItem.from === "me" ? "justify-end" : "justify-start"} relative`}>
                {/* Call Log Message */}
                {msgItem.type === "call_log" ? (
                  <div className="mx-auto my-1 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 shadow-2xs">
                    {msgItem.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 relative group transition-all ${msgItem.from === "me"
                        ? "bg-[#C04A22]/15 text-slate-900 rounded-br-sm shadow-2xs font-medium"
                        : "bg-white border border-border text-foreground rounded-bl-sm"
                      }`}
                  >
                    {/* WhatsApp Dropdown Chevron Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMsgForAction(selectedMsgForAction?.id === msgItem.id ? null : msgItem);
                      }}
                      className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs z-10 active:scale-95"
                      title="Message options"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* WhatsApp In-Place Dropdown Popover attached directly to message bubble */}
                    {selectedMsgForAction?.id === msgItem.id && (
                      <div className={`absolute right-2 z-40 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-fadeIn text-xs font-semibold text-slate-700 ${isNearBottom ? "bottom-8" : "top-8"
                        }`}>
                        {/* Quick Emoji Reactions Bar */}
                        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 mb-1.5">
                          {["❤️", "👍", "😂", "😮", "😢", "🙏", "🔥"].map(emoji => (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddReaction(msgItem.id, emoji);
                              }}
                              className="text-base hover:scale-125 transition cursor-pointer p-0.5 active:scale-95"
                              title={`React ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Action Items List */}
                        <div className="space-y-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingToMsg(msgItem);
                              setSelectedMsgForAction(null);
                            }}
                            className="w-full px-2.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
                          >
                            <Reply className="w-3.5 h-3.5 text-[#C04A22]" /> Reply
                          </button>

                          {msgItem.text && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyMsgText(msgItem.text!);
                              }}
                              className="w-full px-2.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-600" /> Copy Text
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePinMessage(msgItem);
                            }}
                            className="w-full px-2.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
                          >
                            <Pin className="w-3.5 h-3.5 text-amber-500" /> {msgItem.isPinned ? "Unpin Message" : "Pin Message"}
                          </button>

                          {msgItem.text && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTranslateSingleMsg(msgItem);
                              }}
                              className="w-full px-2.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
                            >
                              <Languages className="w-3.5 h-3.5 text-blue-500" /> Translate
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowForwardModal(msgItem);
                              setSelectedMsgForAction(null);
                            }}
                            className="w-full px-2.5 py-1.5 flex items-center gap-2.5 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Forward
                          </button>

                          <hr className="my-1 border-slate-100" />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMsg(msgItem.id);
                            }}
                            className="w-full px-2.5 py-1.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quoted Reply Header inside bubble */}
                    {msgItem.replyToText && (
                      <div className="mb-2 p-2 rounded-xl bg-black/5 border-l-3 border-l-[#C04A22] text-xs">
                        <span className="font-bold text-[#8C3015] block text-[10px]">{msgItem.replyToSender || "Replied"}</span>
                        <span className="text-slate-700 truncate block">{msgItem.replyToText}</span>
                      </div>
                    )}

                    {/* File Attachment Message */}
                    {msgItem.type === "file" ? (
                      <div className="flex items-center gap-3 p-1 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-[#C04A22]/10 text-[#C04A22] flex items-center justify-center flex-shrink-0 border border-[#C04A22]/20">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{msgItem.fileName}</p>
                          <p className="text-[10px] text-slate-500">{msgItem.fileSize}</p>
                        </div>
                        <button className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : msgItem.type === "image" ? (
                      /* Image Message */
                      <div className="space-y-1 pr-2">
                        <img src={msgItem.imageUrl} alt="Attached" className="max-w-full rounded-xl max-h-60 object-cover shadow-xs border border-slate-200" />
                      </div>
                    ) : msgItem.type === "voice" ? (
                      /* Voice Note Message */
                      <div className="flex items-center gap-3 min-w-[180px] py-1 pr-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingVoiceId(playingVoiceId === msgItem.id ? null : msgItem.id);
                          }}
                          className="w-9 h-9 rounded-full bg-[#C04A22] text-white flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                        >
                          {playingVoiceId === msgItem.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1">
                            {[3, 7, 4, 9, 6, 10, 5, 8, 4, 7, 5, 3].map((h, idx) => (
                              <span
                                key={idx}
                                className={`w-1 rounded-full ${playingVoiceId === msgItem.id ? "bg-[#C04A22] animate-pulse" : "bg-slate-300"}`}
                                style={{ height: `${h * 2}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 block">{msgItem.duration}</span>
                        </div>
                      </div>
                    ) : (
                      /* Regular Text Message */
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-line pr-4">{msgItem.text}</p>

                        {/* Auto-translated card when Enabled */}
                        {((isTranslating && msgItem.from === "them") || msgItem.isManuallyTranslated) && msgItem.translatedText && (
                          <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-[#8C3015] bg-[#C04A22]/5 p-2 rounded-lg space-y-0.5 animate-fadeIn">
                            <span className="text-[10px] font-bold text-[#C04A22] flex items-center gap-1">
                              <Languages className="w-3 h-3" /> বাংলা অনুবাদ:
                            </span>
                            <p className="font-medium text-slate-800">{msgItem.translatedText}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Reaction Badges Container */}
                    {msgItem.reactions && Object.keys(msgItem.reactions).length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {Object.entries(msgItem.reactions).map(([emoji, count]) => (
                          <span key={emoji} className="bg-white border border-slate-200 shadow-2xs rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                            <span>{emoji}</span>
                            {(count as number) > 1 && <span className="text-[10px] font-bold text-slate-600">{count as number}</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Status */}
                    <div className={`flex items-center gap-1 mt-1 ${msgItem.from === "me" ? "justify-end" : ""}`}>
                      {msgItem.isPinned && (
                        <span title="Pinned" className="inline-flex items-center">
                          <Pin className="w-3 h-3 text-[#C04A22] mr-1" />
                        </span>
                      )}
                      <span className={`text-[10px] ${msgItem.from === "me" ? "text-slate-600" : "text-muted-foreground"}`}>{msgItem.time}</span>
                      {msgItem.from === "me" && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msgItem.read ? "text-[#C04A22]" : "text-slate-400"}`} />
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Section */}
      <div className="p-2 sm:p-3.5 border-t border-border bg-white relative">
        {/* Quoted Reply Banner above input */}
        {replyingToMsg && (
          <div className="flex items-center justify-between bg-slate-100 border-l-4 border-l-[#C04A22] px-3.5 py-2 rounded-xl text-xs mb-2 animate-fadeIn">
            <div className="min-w-0 flex-1">
              <span className="font-bold text-[#8C3015] block text-[11px]">
                Reply to {replyingToMsg.from === "me" ? "You" : conv.name}
              </span>
              <span className="text-slate-600 truncate block font-medium">
                {replyingToMsg.text || replyingToMsg.fileName || "Media Message"}
              </span>
            </div>
            <button onClick={() => setReplyingToMsg(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Upload Option Popup */}
        {showImagePicker && (
          <div className="absolute bottom-16 left-2 sm:left-12 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 animate-fadeIn flex gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#C04A22]/10 text-xs font-semibold text-slate-700 hover:text-[#8C3015] transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#C04A22]" /> Camera
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#C04A22]/10 text-xs font-semibold text-slate-700 hover:text-[#8C3015] transition cursor-pointer"
            >
              <FileImage className="w-4 h-4 text-[#C04A22]" /> Gallery
            </button>
          </div>
        )}

        {/* Voice Recording Mode Bar */}
        {isRecordingVoice ? (
          <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-2xl px-3 sm:px-4 py-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-xs min-w-0">
              {isPlayingRecording ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#C04A22] animate-pulse flex-shrink-0" />
                  <span className="truncate text-slate-800 font-medium">
                    Listening ({formatSeconds(playbackTime)} / {formatSeconds(recordTime || 1)})
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  <span className="truncate">Recording... ({formatSeconds(recordTime)})</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Listen Preview Button (to the left of Cancel) */}
              <button
                type="button"
                onClick={handleToggleListenVoice}
                className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#C04A22] transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                title={isPlayingRecording ? "Pause voice preview" : "Listen to your recorded voice"}
              >
                {isPlayingRecording ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#C04A22]" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#C04A22] fill-[#C04A22]" />
                    <span>Listen</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="px-3 py-1 rounded-xl bg-[#C04A22] text-white text-xs font-bold hover:bg-[#8C3015] transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        ) : (
          /* Normal Chat Input Row */
          <div className="flex items-center gap-1 sm:gap-2">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-secondary text-slate-500 hover:text-[#C04A22] transition-colors flex-shrink-0 cursor-pointer"
              title="Attach File (PDF, DOCX)"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            {/* Image Upload (Camera / Gallery) Button */}
            <button
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-secondary text-slate-500 hover:text-[#C04A22] transition-colors flex-shrink-0 cursor-pointer"
              title="Send Image (Camera or Gallery)"
            >
              <ImageIcon className="w-4.5 h-4.5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendText()}
              placeholder="Type a message..."
              className="flex-1 min-w-0 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-input-background rounded-xl border border-border text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#C04A22] focus:border-[#C04A22] transition"
            />

            {/* Auto Translation Toggle Button */}
            <button
              onClick={() => {
                setIsTranslating(!isTranslating);
                showToast(isTranslating ? "Auto Translation disabled" : "Auto Translation enabled (English ⇄ Bangla)");
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors flex-shrink-0 cursor-pointer relative ${isTranslating
                  ? "bg-[#C04A22]/20 text-[#8C3015] border border-[#C04A22]/40"
                  : "hover:bg-secondary text-slate-500 hover:text-[#C04A22]"
                }`}
              title="Toggle Auto Translation (English ⇄ Bangla)"
            >
              <Languages className="w-4.5 h-4.5" />
              {isTranslating && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#C04A22]" />
              )}
            </button>

            {/* Send Text or Mic Button */}
            {inputText.trim() ? (
              <button
                onClick={handleSendText}
                className="p-2 sm:p-2.5 rounded-xl bg-[#C04A22] text-white flex-shrink-0 hover:bg-[#8C3015] transition cursor-pointer active:scale-95 shadow-xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsRecordingVoice(true)}
                className="p-2 sm:p-2.5 rounded-xl border border-border text-slate-600 hover:text-[#C04A22] flex-shrink-0 hover:bg-secondary transition cursor-pointer active:scale-95 bg-white"
                title="Record Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transparent backdrop overlay to dismiss message dropdown popover on click outside */}
      {selectedMsgForAction && (
        <div
          onClick={() => setSelectedMsgForAction(null)}
          className="fixed inset-0 z-30 bg-transparent"
        />
      )}

      {/* ── Forward Message Contacts Modal ── */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Forward Message</h4>
              <button onClick={() => setShowForwardModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">Select a contact to forward this message:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setShowForwardModal(null);
                    showToast(`Message forwarded to ${c.name}`);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{c.handle}</p>
                  </div>
                  <Send className="w-3.5 h-3.5 text-[#C04A22] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Audio Call Interactive Modal Popup ── */}
      {isCallingAudio && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm text-center text-slate-900 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C04A22] bg-[#C04A22]/15 px-3 py-1 rounded-full border border-[#C04A22]/30 inline-block">
                Audio Call
              </span>
              <h3 className="text-xl font-bold text-slate-900 pt-2">{conv.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {callDuration === 0 ? "Calling..." : `In Call · ${formatSeconds(callDuration)}`}
              </p>
            </div>

            {/* Pulsing Avatar Container */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#C04A22]/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-[#C04A22] flex items-center justify-center text-slate-500 shadow-md">
                <User className="w-12 h-12 text-slate-400" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setAudioMuted(!audioMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${audioMuted ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                title={audioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleEndCall("audio")}
                className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center transition hover:bg-red-700 cursor-pointer active:scale-95 shadow-md"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${!speakerOn ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                title={speakerOn ? "Mute Speaker" : "Turn On Speaker"}
              >
                {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Video Call Interactive Modal Popup ── */}
      {isCallingVideo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md h-[520px] overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Main Video View */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black flex items-center justify-center">
              {videoCamOff ? (
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-slate-700 mx-auto flex items-center justify-center">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">Camera turned off</p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-[#C04A22]/20 border-2 border-[#C04A22] mx-auto flex items-center justify-center animate-pulse">
                    <User className="w-12 h-12 text-[#C04A22]" />
                  </div>
                  <p className="text-sm font-bold text-white">{conv.name}</p>
                  <p className="text-xs text-emerald-400 font-semibold">HD Video Connected · {formatSeconds(callDuration)}</p>
                </div>
              )}
            </div>

            {/* Top Bar Header */}
            <div className="relative z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
              <div>
                <h4 className="text-sm font-bold text-white">{conv.name}</h4>
                <span className="text-[10px] text-emerald-400 font-semibold">Live Video</span>
              </div>
              <span className="bg-black/40 text-white text-xs px-3 py-1 rounded-full font-mono">
                {formatSeconds(callDuration)}
              </span>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
              <button
                onClick={() => setVideoMicOff(!videoMicOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${videoMicOff ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                {videoMicOff ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoCamOff(!videoCamOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${videoCamOff ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                {videoCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleEndCall("video")}
                className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center transition hover:bg-red-700 cursor-pointer active:scale-95 shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Messenger-Style Contact Details / Info Screen (Light Theme: White Background, Dark/Black Text) ── */}
      {showContactDetails && (
        <div className="absolute inset-0 z-30 bg-white text-slate-900 flex flex-col overflow-y-auto animate-fadeIn select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-100 shadow-2xs">
            <button
              onClick={() => setShowContactDetails(false)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer active:scale-95"
              title="Back to chat"
            >
              <ArrowLeft className="w-6 h-6 text-slate-900" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowContactMoreMenu(!showContactMoreMenu)}
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer active:scale-95"
                title="Options"
              >
                <MoreVertical className="w-6 h-6 text-slate-900" />
              </button>

              {showContactMoreMenu && (
                <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-slate-800 animate-fadeIn">
                  <button
                    onClick={() => { setShowContactMoreMenu(false); handleOpenUserProfile(); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" /> Go to Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowContactMoreMenu(false);
                      setIsMuted(!isMuted);
                      showToast(isMuted ? "Notifications unmuted" : "Notifications muted");
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-slate-500" /> {isMuted ? "Unmute" : "Mute notifications"}
                  </button>
                  <button
                    onClick={() => { setShowContactMoreMenu(false); showToast(`Blocked ${conv.name}`); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                  >
                    <UserX className="w-4 h-4 text-red-500" /> Block user
                  </button>
                  <button
                    onClick={() => { setShowContactMoreMenu(false); showToast("Report submitted to review"); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer"
                  >
                    <Flag className="w-4 h-4 text-red-500" /> Report conversation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Overview (Centered Avatar & Name) */}
          <div className="flex flex-col items-center pt-4 pb-6 px-4">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-slate-200 shadow-xl flex items-center justify-center bg-slate-100">
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>
              {conv.online && (
                <div className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mt-4 tracking-wide">
              {contactNickname || conv.name}
            </h2>
            {contactNickname && (
              <span className="text-xs text-slate-500 mt-0.5">{conv.name}</span>
            )}
            <span className="text-xs text-slate-500 mt-1 font-medium">
              {conv.online ? "Active now" : "Active recently"} • {conv.handle}
            </span>
            {conv.bio && (
              <p className="text-xs text-slate-600 text-center max-w-sm mt-1.5 px-4 line-clamp-2">
                {conv.bio}
              </p>
            )}

            {/* 4 Action Buttons Row: Profile | Nicknames | Search | Customize */}
            <div className="grid grid-cols-4 gap-4 sm:gap-6 mt-7 w-full max-w-xs sm:max-w-sm px-2">
              {/* 1. Profile Button - Navigates to user profile */}
              <button
                onClick={handleOpenUserProfile}
                className="flex flex-col items-center group cursor-pointer"
                title="View Profile"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200/80 group-active:scale-90 transition-all flex items-center justify-center text-slate-800 shadow-2xs">
                  <svg className="w-5 h-5 text-slate-800 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-700 font-semibold mt-1.5 group-hover:text-slate-900">Profile</span>
              </button>

              {/* 2. Nicknames Button */}
              <button
                onClick={() => {
                  setTempNickname(contactNickname || conv.name);
                  setShowNicknameModal(true);
                }}
                className="flex flex-col items-center group cursor-pointer"
                title="Change Nickname"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200/80 group-active:scale-90 transition-all flex items-center justify-center text-slate-800 shadow-2xs">
                  <span className="text-base font-bold text-slate-800 tracking-tight">Aa</span>
                </div>
                <span className="text-xs text-slate-700 font-semibold mt-1.5 group-hover:text-slate-900">Nicknames</span>
              </button>

              {/* 3. Search Button */}
              <button
                onClick={() => {
                  setShowContactDetails(false);
                  setShowSearchOverlay(true);
                }}
                className="flex flex-col items-center group cursor-pointer"
                title="Search conversation"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200/80 group-active:scale-90 transition-all flex items-center justify-center text-slate-800 shadow-2xs">
                  <Search className="w-5 h-5 text-slate-800" />
                </div>
                <span className="text-xs text-slate-700 font-semibold mt-1.5 group-hover:text-slate-900">Search</span>
              </button>

              {/* 4. Customize Button */}
              <button
                onClick={() => setShowThemePicker(true)}
                className="flex flex-col items-center group cursor-pointer"
                title="Customize Theme"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200/80 group-active:scale-90 transition-all flex items-center justify-center text-slate-800 shadow-2xs">
                  <Palette className="w-5 h-5 text-slate-800" />
                </div>
                <span className="text-xs text-slate-700 font-semibold mt-1.5 group-hover:text-slate-900">Customize</span>
              </button>
            </div>
          </div>

          {/* Chat Info Section */}
          <div className="px-4 py-2 mt-2 max-w-lg mx-auto w-full flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Chat info
            </h3>
            <div className="bg-slate-50/90 rounded-2xl overflow-hidden border border-slate-200/90 divide-y divide-slate-200/80 shadow-xs">
              <button
                onClick={() => setShowMediaFilesModal(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-100/90 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-700">
                    <ImageIcon className="w-4.5 h-4.5 text-slate-700" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">View media, files & links</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  showToast(isMuted ? "Notifications unmuted" : "Notifications muted");
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-100/90 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-700">
                    {isMuted ? <BellOff className="w-4.5 h-4.5 text-amber-500" /> : <Bell className="w-4.5 h-4.5 text-slate-700" />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Mute notifications</span>
                    <p className="text-[11px] text-slate-500">{isMuted ? "Muted" : "Unmuted"}</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${isMuted ? "bg-[#C04A22] justify-end" : "bg-slate-300 justify-start"}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </div>
              </button>

              <button
                onClick={() => {
                  onTogglePin(convId);
                  showToast(isPinned ? "Unpinned conversation" : "Pinned to top");
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-100/90 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200/90 flex items-center justify-center text-slate-700">
                    <Pin className={`w-4.5 h-4.5 ${isPinned ? "text-[#C04A22]" : "text-slate-700"}`} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Pin conversation</span>
                    <p className="text-[11px] text-slate-500">{isPinned ? "Pinned to top of inbox" : "Not pinned"}</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${isPinned ? "bg-[#C04A22] justify-end" : "bg-slate-300 justify-start"}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </div>
              </button>
            </div>

            {/* Privacy & Support */}
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mt-6 mb-2">
              Privacy & Support
            </h3>
            <div className="bg-slate-50/90 rounded-2xl overflow-hidden border border-slate-200/90 divide-y divide-slate-200/80 mb-8 shadow-xs">
              <button
                onClick={() => showToast(`Blocked ${conv.name}`)}
                className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-red-50/80 transition-colors text-left cursor-pointer text-red-600"
              >
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <UserX className="w-4.5 h-4.5 text-red-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-red-600">Block {conv.name}</span>
                  <p className="text-[11px] text-slate-500">They won't be able to call you or send messages</p>
                </div>
              </button>

              <button
                onClick={() => showToast("Report submitted to moderation")}
                className="w-full px-4 py-3.5 flex items-center gap-3.5 hover:bg-red-50/80 transition-colors text-left cursor-pointer text-red-600"
              >
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <Flag className="w-4.5 h-4.5 text-red-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-red-600">Report conversation</span>
                  <p className="text-[11px] text-slate-500">Report suspicious or inappropriate behavior</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Nicknames Modal ── */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold mb-1 text-slate-900">Set Nickname</h3>
            <p className="text-xs text-slate-500 mb-4">Set a custom nickname for {conv.name} in this conversation.</p>
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              placeholder="Enter nickname..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#C04A22] mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setContactNickname("");
                  setShowNicknameModal(false);
                  showToast("Nickname cleared");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setShowNicknameModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setContactNickname(tempNickname.trim());
                  setShowNicknameModal(false);
                  showToast(`Nickname set to "${tempNickname.trim() || conv.name}"`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C04A22] hover:bg-[#a83f1d] text-white transition cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Theme Picker Modal ── */}
      {showThemePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Chat Theme</h3>
              <button onClick={() => setShowThemePicker(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">Choose an accent color for this chat conversation.</p>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                { name: "Terracotta", hex: "#C04A22" },
                { name: "Messenger Blue", hex: "#0084FF" },
                { name: "Emerald", hex: "#059669" },
                { name: "Purple", hex: "#7C3AED" },
                { name: "Rose", hex: "#E11D48" },
              ].map(theme => (
                <button
                  key={theme.hex}
                  onClick={() => {
                    setChatThemeColor(theme.hex);
                    setShowThemePicker(false);
                    showToast(`Chat theme changed to ${theme.name}`);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border-2"
                    style={{
                      backgroundColor: theme.hex,
                      borderColor: chatThemeColor === theme.hex ? "#1e293b" : "transparent"
                    }}
                  >
                    {chatThemeColor === theme.hex && <Check className="w-5 h-5 text-white stroke-[2.5]" />}
                  </div>
                  <span className="text-[10px] text-slate-600 truncate w-full text-center font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Media, Files & Links Modal ── */}
      {showMediaFilesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl max-w-lg w-full h-[80vh] max-h-[600px] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#C04A22]" />
                <h3 className="font-bold text-base text-slate-900">Media, Files & Links</h3>
              </div>
              <button
                onClick={() => setShowMediaFilesModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 gap-4">
              <button
                onClick={() => setActiveMediaTab("media")}
                className={`py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeMediaTab === "media"
                    ? "border-[#C04A22] text-[#C04A22]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Media (4)
              </button>
              <button
                onClick={() => setActiveMediaTab("files")}
                className={`py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeMediaTab === "files"
                    ? "border-[#C04A22] text-[#C04A22]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Files & Docs (3)
              </button>
              <button
                onClick={() => setActiveMediaTab("links")}
                className={`py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeMediaTab === "links"
                    ? "border-[#C04A22] text-[#C04A22]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Links (3)
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeMediaTab === "media" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 1, title: "Consultation Appointment", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&fit=crop" },
                    { id: 2, title: "Legal Office NYC", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&fit=crop" },
                    { id: 3, title: "Visa Documentation", url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&fit=crop" },
                    { id: 4, title: "USCIS Notice Review", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&fit=crop" },
                  ].map(item => (
                    <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[11px] text-white font-medium truncate">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeMediaTab === "files" && (
                <div className="space-y-2.5">
                  {[
                    { name: "I-485_Application_Checklist_2026.pdf", size: "1.4 MB", date: "Yesterday" },
                    { name: "I-765_Work_Authorization_Renewal.pdf", size: "820 KB", date: "Sep 3" },
                    { name: "EB2_NIW_Required_Documents.pdf", size: "2.1 MB", date: "Aug 28" },
                  ].map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Downloaded ${file.name}`)}
                        className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer flex-shrink-0"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeMediaTab === "links" && (
                <div className="space-y-2.5">
                  {[
                    { title: "USCIS Official I-485 Form & Instructions", url: "https://www.uscis.gov/i-485", domain: "uscis.gov" },
                    { title: "U.S. Department of State Visa Bulletin", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html", domain: "travel.state.gov" },
                    { title: "Schedule 30-min Free Legal Consultation", url: "https://nadialaw.nyc/consultation", domain: "nadialaw.nyc" },
                  ].map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-[#C04A22] transition truncate">{link.title}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{link.domain}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Messages() {
  const [searchParams] = useSearchParams();
  const chatParam = searchParams.get("chat") || searchParams.get("user") || searchParams.get("id");
  const nameParam = searchParams.get("name");

  const [conversationsList, setConversationsList] = useState<ConversationItem[]>(() => {
    try {
      const saved = localStorage.getItem("pathasathi_user_conversations_v2");
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialConversations;
  });

  useEffect(() => {
    try {
      localStorage.setItem("pathasathi_user_conversations_v2", JSON.stringify(conversationsList));
    } catch {}
  }, [conversationsList]);

  const [selectedConv, setSelectedConv] = useState<number | null>(() => {
    if (chatParam) {
      const cleanParam = chatParam.replace('@', '').toLowerCase();
      const match = initialConversations.find(
        c => c.handle.replace('@', '').toLowerCase() === cleanParam ||
             c.handle.toLowerCase().includes(cleanParam) ||
             cleanParam.includes(c.handle.replace('@', '').toLowerCase()) ||
             c.name.toLowerCase().includes(cleanParam.replace(/_/g, ' ').toLowerCase()) ||
             c.id.toString() === chatParam
      );
      if (match) return match.id;
    }
    // On desktop screens, select the first conversation
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return 1;
    }
    return null;
  });

  const [pinnedIds, setPinnedIds] = useState<number[]>([1]);
  const isSeller = searchParams.get("role") === "seller";

  useEffect(() => {
    if (chatParam) {
      const cleanParam = chatParam.replace('@', '').toLowerCase();
      const match = conversationsList.find(
        c => c.handle.replace('@', '').toLowerCase() === cleanParam ||
             c.handle.toLowerCase().includes(cleanParam) ||
             cleanParam.includes(c.handle.replace('@', '').toLowerCase()) ||
             c.name.toLowerCase().includes(cleanParam.replace(/_/g, ' ').toLowerCase()) ||
             c.id.toString() === chatParam
      );
      if (match) {
        setSelectedConv(match.id);
      } else {
        // Dynamically add and open new conversation for this user
        const newId = Date.now();
        const displayName = nameParam ? decodeURIComponent(nameParam) : cleanParam.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const newConv: ConversationItem = {
          id: newId,
          name: displayName,
          handle: `@${cleanParam}`,
          bio: "Community Member",
          lastMsg: "Start a conversation…",
          time: "Just now",
          unread: 0,
          online: true,
        };
        setConversationsList(prev => [newConv, ...prev]);
        setSelectedConv(newId);
      }
    }
  }, [chatParam, nameParam]);

  const handleTogglePin = (id: number) => {
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout variant={isSeller ? "seller" : "buyer"} activeTab="messages" noPad hideNav={Boolean(selectedConv)}>
      <div className="flex h-screen max-h-screen overflow-hidden">
        {/* Inbox - always visible on desktop, hidden on mobile when chat is open */}
        <div className={`${selectedConv ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 xl:w-96 border-r border-border bg-white flex-shrink-0`}>
          <InboxList conversations={conversationsList} onSelect={setSelectedConv} selected={selectedConv} pinnedIds={pinnedIds} />
        </div>

        {/* Chat view */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            <ChatScreen
              convId={selectedConv}
              conversations={conversationsList}
              onBack={() => setSelectedConv(null)}
              pinnedIds={pinnedIds}
              onTogglePin={handleTogglePin}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#C04A22]/10 text-[#C04A22] flex items-center justify-center mx-auto mb-4 border border-[#C04A22]/20">
                <Send className="w-8 h-8 text-[#C04A22]" />
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
