import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "bn" | "de" | "fr" | "es" | "ar" | "ja" | "it" | "ms";

export interface LanguageMeta {
  code: Lang;
  name: string;
  nativeName: string;
  flag: string;
  direction?: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", direction: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", direction: "rtl" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", direction: "ltr" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", direction: "ltr" },
];

export const COUNTRY_CODE_TO_LANG: Record<string, Lang> = {
  US: "en",
  BD: "en",
  CA: "en",
  GB: "en",
  DE: "en",
  AU: "en",
  AE: "en",
  JP: "en",
  FR: "en",
  IT: "en",
  SA: "en",
  MY: "en",
  ES: "en",
  IN: "en",
  NO: "en",
};

const STORAGE_KEY = "ic_lang";
const USER_SELECTED_KEY = "ic_lang_user_selected";

interface LanguageContextValue {
  lang: Lang;
  language: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  supportedLanguages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectLanguageFromUrlOrStorage(): Lang {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      // 1. Direct explicit ?lang=...
      const qLang = params.get("lang")?.toLowerCase();
      if (qLang && qLang !== "ja" && (qLang in translations)) {
        return qLang as Lang;
      }
      // 2. Explicit user selection in localStorage (if user clicked toggle)
      const userSelected = localStorage.getItem(USER_SELECTED_KEY);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (userSelected === "true" && stored && stored !== "ja" && (stored in translations)) {
        return stored as Lang;
      }
    } catch {
      // ignore
    }
  }
  // Default language is English for any country
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLanguageFromUrlOrStorage());

  const setLang = (l: Lang) => {
    if ((l as string) === "ja") l = "en";
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      localStorage.setItem(USER_SELECTED_KEY, "true");
    } catch {
      // ignore
    }
  };

  // Immediate cleanup of residual Japanese language or Japan country in localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "ja") {
        localStorage.removeItem(STORAGE_KEY);
        setLangState("en");
      }
      if (localStorage.getItem("ic_active_country") === "JP") {
        localStorage.setItem("ic_active_country", "US");
      }
    } catch (_) {}
  }, []);

  // Sync with browser URL changes / popstate
  useEffect(() => {
    const handleUrlSync = () => {
      const detected = detectLanguageFromUrlOrStorage();
      if (detected && detected !== lang) {
        setLangState(detected);
      }
    };

    window.addEventListener("popstate", handleUrlSync);
    return () => window.removeEventListener("popstate", handleUrlSync);
  }, [lang]);

  // Sync document lang and direction (RTL for Arabic)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      if (lang === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
      } else {
        document.documentElement.setAttribute("dir", "ltr");
      }
    }
  }, [lang]);

  const t = (key: string): string => {
    const map = translations[lang] || translations.en;
    return map[key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, language: lang, setLang, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

// ─── Translation Dictionaries ──────────────────────────────────────────────────

type TranslationMap = Record<string, string>;

const en: TranslationMap = {
  // Navigation
  home: "Home",
  search: "Explore",
  explore: "Explore",
  map: "Map",
  services: "Services",
  reels: "Reels",
  orders: "Orders",
  more: "More",
  communities: "Communities",
  messages: "Messages",
  notifications: "Notifications",
  profile: "Profile",
  saved: "Saved",
  qa: "Q&A",
  settings: "Settings",
  admin: "Admin",
  seller: "Seller Portal",

  // Sidebar / More descriptions
  admin_desc: "Admin & moderation panel",
  qa_desc: "Community questions & advice",
  saved_desc: "Your saved resources & bookmarks",
  settings_desc: "Account & app preferences",

  // HomeFeed tabs
  tab_foryou: "For You",
  tab_following: "Following",
  tab_map: "Map",
  tab_local: "Local",

  // PostComposer
  post_type_question: "Ask",
  post_type_tip: "Tip",
  post_type_need_help: "Need Help",
  post_placeholder_default: "What's on your mind?",
  post_placeholder_question: "Ask the community something...",
  post_placeholder_tip: "Share a helpful local tip...",
  post_placeholder_need_help: "Describe what help you need...",
  post_btn: "Post",

  // Post labels
  label_emergency: "Emergency Alert",
  label_question: "Ask the Community",
  label_tip: "Local Tip",
  label_need_help: "Need Help",
  label_announcement: "Community Announcement",
  label_achievement: "Milestone",
  label_poll: "Community Poll",

  // Post actions
  action_comment: "Comment",
  action_repost: "Repost",
  action_share: "Share",
  action_bookmark: "Save",

  // Widgets
  widget_who_to_follow: "Who to Follow",
  widget_near_you: "Near You",
  widget_view_map: "View map",
  widget_follow: "Follow",
  widget_interested: "Interested 🙋",
  widget_see_more: "See more suggestions →",
  widget_view_map_arrow: "View map →",

  // Quick Access
  qa_box_title: "Quick Access",
  qa_box_subtitle: "Tap to visit · tap again to pin/unpin",
  qa_box_pinned: "Pinned",
  qa_box_all: "All Features",
  qa_box_add: "Add Shortcuts",
  qa_box_all_pinned: "All features pinned!",

  // Calendar
  cal_has_events: "Has events",
  cal_today: "Today",
  cal_no_events: "No events on this day",
  cal_no_events_hint: "Dates with a blue dot have community events.",
  cal_back: "Back to Feed",

  // Empty states
  empty_following: "No following yet",
  empty_following_sub: "Follow people to see their posts here",
  empty_local: "No local posts yet",
  empty_local_sub: "Posts from your area will appear here",

  // Following banner
  following_banner: "Showing latest posts from the people you follow",

  // Weather
  weather_feels: "Feels like",
  weather_wind: "Wind",
  weather_humidity: "Humidity",
  weather_high: "High",
  weather_low: "Low",
  weather_loading: "Loading weather...",
  weather_locating: "Locating...",
  weather_error: "Could not load weather",
  weather_allow: "Allow location",

  // Language picker
  switch_language: "Switch Language",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "Active Country Portal",
};

const bn: TranslationMap = {
  // Navigation
  home: "হোম",
  search: "খোঁজুন",
  explore: "খোঁজুন",
  map: "মানচিত্র",
  services: "সেবা",
  reels: "রিলস",
  orders: "অর্ডারসমূহ",
  more: "আরও",
  communities: "কমিউনিটি",
  messages: "বার্তা",
  notifications: "বিজ্ঞপ্তি",
  profile: "প্রোফাইল",
  saved: "সংরক্ষিত",
  qa: "প্রশ্নোত্তর",
  settings: "সেটিংস",
  admin: "অ্যাডমিন",
  seller: "সেলার পোর্টাল",

  // Sidebar / More descriptions
  admin_desc: "অ্যাডমিন ও মডারেশন প্যানেল",
  qa_desc: "কমিউনিটি প্রশ্নোত্তর ও পরামর্শ",
  saved_desc: "আপনার সংরক্ষিত রিসোর্সসমূহ",
  settings_desc: "অ্যাকাউন্ট ও অ্যাপ সেটিংস",

  // HomeFeed tabs
  tab_foryou: "আপনার জন্য",
  tab_following: "অনুসরণ",
  tab_map: "ম্যাপস",
  tab_local: "স্থানীয়",

  // PostComposer
  post_type_question: "জিজ্ঞেস",
  post_type_tip: "টিপস",
  post_type_need_help: "সাহায্য",
  post_placeholder_default: "আপনার মনে কী আছে?",
  post_placeholder_question: "কমিউনিটিকে কিছু জিজ্ঞেস করুন...",
  post_placeholder_tip: "একটি স্থানীয় টিপস শেয়ার করুন...",
  post_placeholder_need_help: "আপনার কী সাহায্য দরকার বলুন...",
  post_btn: "পোস্ট করুন",

  // Post labels
  label_emergency: "জরুরি বিজ্ঞপ্তি",
  label_question: "কমিউনিটিকে জিজ্ঞেস করুন",
  label_tip: "স্থানীয় টিপস",
  label_need_help: "সাহায্য দরকার",
  label_announcement: "কমিউনিটি ঘোষণা",
  label_achievement: "মাইলফলক",
  label_poll: "কমিউনিটি ভোট",

  // Post actions
  action_comment: "মন্তব্য",
  action_repost: "রিপোস্ট",
  action_share: "শেয়ার",
  action_bookmark: "সংরক্ষণ",

  // Widgets
  widget_who_to_follow: "কাকে অনুসরণ করবেন",
  widget_near_you: "কাছাকাছি",
  widget_view_map: "মানচিত্র দেখুন",
  widget_follow: "অনুসরণ",
  widget_interested: "আগ্রহী 🙋",
  widget_see_more: "আরও পরামর্শ দেখুন →",
  widget_view_map_arrow: "মানচিত্র দেখুন →",

  // Quick Access
  qa_box_title: "দ্রুত অ্যাক্সেস",
  qa_box_subtitle: "ট্যাপ করুন · আবার ট্যাপ করে পিন/আনপিন করুন",
  qa_box_pinned: "পিন করা",
  qa_box_all: "সব ফিচার",
  qa_box_add: "শর্টকাট যোগ করুন",
  qa_box_all_pinned: "সব ফিচার পিন করা!",

  // Calendar
  cal_has_events: "ইভেন্ট আছে",
  cal_today: "আজ",
  cal_no_events: "এই দিনে কোনো ইভেন্ট নেই",
  cal_no_events_hint: "নীল বিন্দু সহ তারিখে কমিউনিটি ইভেন্ট আছে।",
  cal_back: "ফিডে ফিরুন",

  // Empty states
  empty_following: "এখনও কাউকে অনুসরণ করেননি",
  empty_following_sub: "পোস্ট দেখতে মানুষদের অনুসরণ করুন",
  empty_local: "এখনও কোনো স্থানীয় পোস্ট নেই",
  empty_local_sub: "আপনার এলাকার পোস্ট এখানে দেখাবে",

  // Following banner
  following_banner: "আপনি যে মানুষগুলোকে অনুসরণ করেন তাদের সর্বশেষ পোস্ট",

  // Weather
  weather_feels: "অনুভূতি",
  weather_wind: "বাতাস",
  weather_humidity: "আর্দ্রতা",
  weather_high: "সর্বোচ্চ",
  weather_low: "সর্বনিম্ন",
  weather_loading: "আবহাওয়া লোড হচ্ছে...",
  weather_locating: "অবস্থান খোঁজা হচ্ছে...",
  weather_error: "আবহাওয়া লোড করা যায়নি",
  weather_allow: "অবস্থান অনুমতি দিন",

  // Language picker
  switch_language: "ভাষা পরিবর্তন",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "সক্রিয় দেশের পোর্টাল",
};

const de: TranslationMap = {
  // Navigation
  home: "Startseite",
  search: "Entdecken",
  explore: "Entdecken",
  map: "Karte",
  services: "Dienste",
  reels: "Reels",
  orders: "Bestellungen",
  more: "Mehr",
  communities: "Gemeinschaften",
  messages: "Nachrichten",
  notifications: "Benachrichtigungen",
  profile: "Profil",
  saved: "Gespeichert",
  qa: "Fragen & Antworten",
  settings: "Einstellungen",
  admin: "Admin",
  seller: "Verkäufer-Portal",

  admin_desc: "Admin- und Moderationsbereich",
  qa_desc: "Gemeinschaftsfragen & Ratschläge",
  saved_desc: "Gespeicherte Ressourcen & Lesezeichen",
  settings_desc: "Konto & App-Einstellungen",

  tab_foryou: "Für dich",
  tab_following: "Gefolgt",
  tab_map: "Karte",
  tab_local: "Lokal",

  post_type_question: "Fragen",
  post_type_tip: "Tipp",
  post_type_need_help: "Hilfe",
  post_placeholder_default: "Was gibt es Neues?",
  post_placeholder_question: "Frage die Community...",
  post_placeholder_tip: "Teile einen lokalen Tipp...",
  post_placeholder_need_help: "Beschreibe, welche Hilfe du benötigst...",
  post_btn: "Veröffentlichen",

  label_emergency: "Notfallwarnung",
  label_question: "Frage an die Community",
  label_tip: "Lokaler Tipp",
  label_need_help: "Hilfe gesucht",
  label_announcement: "Community-Mitteilung",
  label_achievement: "Meilenstein",
  label_poll: "Community-Umfrage",

  action_comment: "Kommentieren",
  action_repost: "Teilen",
  action_share: "Weiterleiten",
  action_bookmark: "Speichern",

  widget_who_to_follow: "Empfohlene Kontakte",
  widget_near_you: "In deiner Nähe",
  widget_view_map: "Karte anzeigen",
  widget_follow: "Folgen",
  widget_interested: "Interessiert 🙋",
  widget_see_more: "Mehr Vorschläge →",
  widget_view_map_arrow: "Karte öffnen →",

  qa_box_title: "Schnellzugriff",
  qa_box_subtitle: "Tippen zum Öffnen · Erneut zum Anheften",
  qa_box_pinned: "Angeheftet",
  qa_box_all: "Alle Funktionen",
  qa_box_add: "Verknüpfung hinzufügen",
  qa_box_all_pinned: "Alle Funktionen angeheftet!",

  cal_has_events: "Veranstaltungen",
  cal_today: "Heute",
  cal_no_events: "Keine Termine an diesem Tag",
  cal_no_events_hint: "Tage mit blauem Punkt enthalten Termine.",
  cal_back: "Zurück zum Feed",

  empty_following: "Noch niemandem gefolgt",
  empty_following_sub: "Folge Personen, um deren Beiträge hier zu sehen",
  empty_local: "Noch keine lokalen Beiträge",
  empty_local_sub: "Beiträge aus deiner Region erscheinen hier",

  following_banner: "Neueste Beiträge der Personen, denen du folgst",

  weather_feels: "Gefühlt wie",
  weather_wind: "Wind",
  weather_humidity: "Luftfeuchtigkeit",
  weather_high: "Max",
  weather_low: "Min",
  weather_loading: "Wetter wird geladen...",
  weather_locating: "Standort wird ermittelt...",
  weather_error: "Wetter konnte nicht geladen werden",
  weather_allow: "Standort freigeben",

  switch_language: "Sprache wechseln",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "Aktives Länderportal",
};

const fr: TranslationMap = {
  home: "Accueil",
  search: "Explorer",
  explore: "Explorer",
  map: "Carte",
  services: "Services",
  reels: "Reels",
  orders: "Commandes",
  more: "Plus",
  communities: "Communautés",
  messages: "Messages",
  notifications: "Notifications",
  profile: "Profil",
  saved: "Enregistrés",
  qa: "Questions-Réponses",
  settings: "Paramètres",
  admin: "Admin",
  seller: "Portail Vendeur",

  admin_desc: "Panneau d'administration et modération",
  qa_desc: "Questions et conseils de la communauté",
  saved_desc: "Vos ressources et signets enregistrés",
  settings_desc: "Préférences du compte et de l'application",

  tab_foryou: "Pour vous",
  tab_following: "Abonnements",
  tab_map: "Carte",
  tab_local: "Local",

  post_type_question: "Poser",
  post_type_tip: "Astuce",
  post_type_need_help: "Besoin d'aide",
  post_placeholder_default: "Quoi de neuf ?",
  post_placeholder_question: "Posez une question à la communauté...",
  post_placeholder_tip: "Partagez une astuce locale...",
  post_placeholder_need_help: "Expliquez l'aide dont vous avez besoin...",
  post_btn: "Publier",

  label_emergency: "Alerte d'urgence",
  label_question: "Question à la communauté",
  label_tip: "Astuce locale",
  label_need_help: "Besoin d'aide",
  label_announcement: "Annonce communautaire",
  label_achievement: "Étape franchie",
  label_poll: "Sondage communautaire",

  action_comment: "Commenter",
  action_repost: "Republier",
  action_share: "Partager",
  action_bookmark: "Enregistrer",

  widget_who_to_follow: "Suggestions d'abonnements",
  widget_near_you: "Près de chez vous",
  widget_view_map: "Voir la carte",
  widget_follow: "Suivre",
  widget_interested: "Intéressé 🙋",
  widget_see_more: "Voir plus de suggestions →",
  widget_view_map_arrow: "Ouvrir la carte →",

  qa_box_title: "Accès rapide",
  qa_box_subtitle: "Appuyez pour ouvrir · Appuyez à nouveau pour épingler",
  qa_box_pinned: "Épinglé",
  qa_box_all: "Toutes les fonctionnalités",
  qa_box_add: "Ajouter un raccourci",
  qa_box_all_pinned: "Tout est épinglé !",

  cal_has_events: "Événements prévus",
  cal_today: "Aujourd'hui",
  cal_no_events: "Aucun événement ce jour",
  cal_no_events_hint: "Les dates marquées d'un point bleu comportent des événements.",
  cal_back: "Retour au flux",

  empty_following: "Aucun abonnement pour le moment",
  empty_following_sub: "Suivez des membres pour voir leurs publications ici",
  empty_local: "Aucune publication locale",
  empty_local_sub: "Les publications de votre région apparaîtront ici",

  following_banner: "Dernières publications de vos abonnements",

  weather_feels: "Ressenti",
  weather_wind: "Vent",
  weather_humidity: "Humidité",
  weather_high: "Max",
  weather_low: "Min",
  weather_loading: "Chargement météo...",
  weather_locating: "Localisation en cours...",
  weather_error: "Impossible de charger la météo",
  weather_allow: "Autoriser la localisation",

  switch_language: "Changer de langue",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "Portail pays actif",
};

const es: TranslationMap = {
  home: "Inicio",
  search: "Explorar",
  explore: "Explorar",
  map: "Mapa",
  services: "Servicios",
  reels: "Reels",
  orders: "Pedidos",
  more: "Más",
  communities: "Comunidades",
  messages: "Mensajes",
  notifications: "Notificaciones",
  profile: "Perfil",
  saved: "Guardados",
  qa: "Preguntas y Respuestas",
  settings: "Ajustes",
  admin: "Admin",
  seller: "Portal Vendedor",

  admin_desc: "Panel de administración y moderación",
  qa_desc: "Preguntas y consejos de la comunidad",
  saved_desc: "Tus recursos y marcadores guardados",
  settings_desc: "Preferencias de cuenta y aplicación",

  tab_foryou: "Para ti",
  tab_following: "Siguiendo",
  tab_map: "Mapa",
  tab_local: "Local",

  post_type_question: "Preguntar",
  post_type_tip: "Consejo",
  post_type_need_help: "Ayuda",
  post_placeholder_default: "¿Qué estás pensando?",
  post_placeholder_question: "Pregunta algo a la comunidad...",
  post_placeholder_tip: "Comparte un consejo local...",
  post_placeholder_need_help: "Describe qué ayuda necesitas...",
  post_btn: "Publicar",

  label_emergency: "Alerta de Emergencia",
  label_question: "Pregunta Comunitaria",
  label_tip: "Consejo Local",
  label_need_help: "Necesito Ayuda",
  label_announcement: "Anuncio Comunitario",
  label_achievement: "Logro",
  label_poll: "Encuesta",

  action_comment: "Comentar",
  action_repost: "Compartir",
  action_share: "Enviar",
  action_bookmark: "Guardar",

  widget_who_to_follow: "A quién seguir",
  widget_near_you: "Cerca de ti",
  widget_view_map: "Ver mapa",
  widget_follow: "Seguir",
  widget_interested: "Interesado 🙋",
  widget_see_more: "Ver más sugerencias →",
  widget_view_map_arrow: "Abrir mapa →",

  qa_box_title: "Acceso Rápido",
  qa_box_subtitle: "Toca para abrir · Toca de nuevo para anclar",
  qa_box_pinned: "Anclado",
  qa_box_all: "Todas las funciones",
  qa_box_add: "Añadir atajo",
  qa_box_all_pinned: "¡Todo anclado!",

  cal_has_events: "Tiene eventos",
  cal_today: "Hoy",
  cal_no_events: "No hay eventos en este día",
  cal_no_events_hint: "Los días con punto azul tienen eventos comunitarios.",
  cal_back: "Volver al Feed",

  empty_following: "Aún no sigues a nadie",
  empty_following_sub: "Sigue a personas para ver sus publicaciones aquí",
  empty_local: "Aún no hay publicaciones locales",
  empty_local_sub: "Las publicaciones de tu área aparecerán aquí",

  following_banner: "Mostrando publicaciones de las personas que sigues",

  weather_feels: "Sensación",
  weather_wind: "Viento",
  weather_humidity: "Humedad",
  weather_high: "Máx",
  weather_low: "Mín",
  weather_loading: "Cargando clima...",
  weather_locating: "Buscando ubicación...",
  weather_error: "No se pudo cargar el clima",
  weather_allow: "Permitir ubicación",

  switch_language: "Cambiar idioma",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "Portal de país activo",
};

const ar: TranslationMap = {
  home: "الرئيسية",
  search: "استكشاف",
  explore: "استكشاف",
  map: "الخريطة",
  services: "الخدمات",
  reels: "ريلز",
  orders: "الطلبات",
  more: "المزيد",
  communities: "المجتمعات",
  messages: "الرسائل",
  notifications: "الإشعارات",
  profile: "الملف الشخصي",
  saved: "المحفوظات",
  qa: "الأسئلة والأجوبة",
  settings: "الإعدادات",
  admin: "الإدارة",
  seller: "بوابة البائع",

  admin_desc: "لوحة الإدارة والإشراف",
  qa_desc: "أسئلة ونصائح المجتمع",
  saved_desc: "الموارد والعلامات المرجعية المحفوظة",
  settings_desc: "تفضيلات الحساب والتطبيق",

  tab_foryou: "لك",
  tab_following: "المتابَعون",
  tab_map: "الخريطة",
  tab_local: "محلي",

  post_type_question: "سؤال",
  post_type_tip: "نصيحة",
  post_type_need_help: "مساعدة",
  post_placeholder_default: "ما الذي يدور في ذهنك؟",
  post_placeholder_question: "اطرح سؤالاً على المجتمع...",
  post_placeholder_tip: "شارك نصيحة محلية مفيدة...",
  post_placeholder_need_help: "صف المساعدة التي تحتاج إليها...",
  post_btn: "نشر",

  label_emergency: "تنبيه طوارئ",
  label_question: "سؤال للمجتمع",
  label_tip: "نصيحة محلية",
  label_need_help: "طلب مساعدة",
  label_announcement: "إعلان مجتمعي",
  label_achievement: "إنجاز",
  label_poll: "استطلاع رأي",

  action_comment: "تعليق",
  action_repost: "إعادة نشر",
  action_share: "مشاركة",
  action_bookmark: "حفظ",

  widget_who_to_follow: "اقتراحات للمتابعة",
  widget_near_you: "بالقرب منك",
  widget_view_map: "عرض الخريطة",
  widget_follow: "متابعة",
  widget_interested: "مهتم 🙋",
  widget_see_more: "المزيد من الاقتراحات ←",
  widget_view_map_arrow: "فتح الخريطة ←",

  qa_box_title: "وصول سريع",
  qa_box_subtitle: "اضغط للزيارة · اضغط مجدداً للتثبيت",
  qa_box_pinned: "مثبت",
  qa_box_all: "جميع الميزات",
  qa_box_add: "إضافة اختصار",
  qa_box_all_pinned: "تم تثبيت جميع الميزات!",

  cal_has_events: "توجد فعاليات",
  cal_today: "اليوم",
  cal_no_events: "لا توجد فعاليات في هذا اليوم",
  cal_no_events_hint: "التواريخ التي تحتوي على نقطة زرقاء تضم فعاليات مجتمعية.",
  cal_back: "العودة للموجز",

  empty_following: "لم تتابع أحداً بعد",
  empty_following_sub: "تابع أشخاصاً لرؤية منشوراتهم هنا",
  empty_local: "لا توجد منشورات محلية بعد",
  empty_local_sub: "ستظهر المنشورات من منطقتك هنا",

  following_banner: "عرض أحدث منشورات الأشخاص الذين تتابعهم",

  weather_feels: "يبدو مثل",
  weather_wind: "الرياح",
  weather_humidity: "الرطوبة",
  weather_high: "العظمى",
  weather_low: "الصغرى",
  weather_loading: "جاري تحميل الطقس...",
  weather_locating: "تحديد الموقع...",
  weather_error: "تعذر تحميل الطقس",
  weather_allow: "السماح بالوصول للموقع",

  switch_language: "تغيير اللغة",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "بوابة الدولة النشطة",
};

const ja: TranslationMap = {
  home: "ホーム",
  search: "探索",
  explore: "探索",
  map: "地図",
  services: "サービス",
  reels: "リール",
  orders: "注文履歴",
  more: "その他",
  communities: "コミュニティ",
  messages: "メッセージ",
  notifications: "通知",
  profile: "プロフィール",
  saved: "保存済み",
  qa: "Q&A",
  settings: "設定",
  admin: "管理者",
  seller: "出品者ポータル",

  admin_desc: "管理およびモデレーションパネル",
  qa_desc: "コミュニティの質問とアドバイス",
  saved_desc: "保存したリソースとブックマーク",
  settings_desc: "アカウントおよびアプリ設定",

  tab_foryou: "おすすめ",
  tab_following: "フォロー中",
  tab_map: "地図",
  tab_local: "地域",

  post_type_question: "質問",
  post_type_tip: "ヒント",
  post_type_need_help: "ヘルプ",
  post_placeholder_default: "いまどうしてる？",
  post_placeholder_question: "コミュニティに質問してみましょう...",
  post_placeholder_tip: "地域のお役立ち情報を共有...",
  post_placeholder_need_help: "必要なサポートを教えてください...",
  post_btn: "投稿",

  label_emergency: "緊急アラート",
  label_question: "コミュニティへの質問",
  label_tip: "地域のヒント",
  label_need_help: "ヘルプ募集",
  label_announcement: "コミュニティからのお知らせ",
  label_achievement: "達成マイルストーン",
  label_poll: "アンケート",

  action_comment: "返信",
  action_repost: "リポスト",
  action_share: "共有",
  action_bookmark: "保存",

  widget_who_to_follow: "おすすめユーザー",
  widget_near_you: "周辺スポット",
  widget_view_map: "地図を見る",
  widget_follow: "フォロー",
  widget_interested: "興味あり 🙋",
  widget_see_more: "おすすめをもっと見る →",
  widget_view_map_arrow: "地図を開く →",

  qa_box_title: "クイックアクセス",
  qa_box_subtitle: "タップして移動 · 再度タップで固定",
  qa_box_pinned: "固定済み",
  qa_box_all: "すべての機能",
  qa_box_add: "ショートカット追加",
  qa_box_all_pinned: "全機能が固定されています！",

  cal_has_events: "イベントあり",
  cal_today: "今日",
  cal_no_events: "この日のイベントはありません",
  cal_no_events_hint: "青い点がある日にイベントが予定されています。",
  cal_back: "フィードに戻る",

  empty_following: "まだ誰もフォローしていません",
  empty_following_sub: "ユーザーをフォローすると投稿がここに表示されます",
  empty_local: "地域の投稿はまだありません",
  empty_local_sub: "あなたの地域の投稿がここに表示されます",

  following_banner: "フォロー中のユーザーの最新投稿を表示中",

  weather_feels: "体感温度",
  weather_wind: "風速",
  weather_humidity: "湿度",
  weather_high: "最高",
  weather_low: "最低",
  weather_loading: "天気を取得中...",
  weather_locating: "現在地を特定中...",
  weather_error: "天気を読み込めませんでした",
  weather_allow: "位置情報を許可",

  switch_language: "言語切り替え",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "有効な国ポータル",
};

const it: TranslationMap = {
  home: "Home",
  search: "Esplora",
  explore: "Esplora",
  map: "Mappa",
  services: "Servizi",
  reels: "Reel",
  orders: "Ordini",
  more: "Altro",
  communities: "Comunità",
  messages: "Messaggi",
  notifications: "Notifiche",
  profile: "Profilo",
  saved: "Salvati",
  qa: "Domande e Risposte",
  settings: "Impostazioni",
  admin: "Admin",
  seller: "Portale Venditori",

  admin_desc: "Pannello di controllo e moderazione",
  qa_desc: "Domande e consigli della comunità",
  saved_desc: "Le tue risorse salvate e preferiti",
  settings_desc: "Preferenze account e applicazione",

  tab_foryou: "Per te",
  tab_following: "Seguiti",
  tab_map: "Mappa",
  tab_local: "Locale",

  post_type_question: "Chiedi",
  post_type_tip: "Consiglio",
  post_type_need_help: "Aiuto",
  post_placeholder_default: "Cosa c'è di nuovo?",
  post_placeholder_question: "Fai una domanda alla comunità...",
  post_placeholder_tip: "Condividi un consiglio locale...",
  post_placeholder_need_help: "Descrivi di quale aiuto hai bisogno...",
  post_btn: "Pubblica",

  label_emergency: "Allerta di Emergenza",
  label_question: "Domanda alla Comunità",
  label_tip: "Consiglio Locale",
  label_need_help: "Richiesta di Aiuto",
  label_announcement: "Annuncio della Comunità",
  label_achievement: "Traguardo",
  label_poll: "Sondaggio",

  action_comment: "Commenta",
  action_repost: "Ripubblica",
  action_share: "Condividi",
  action_bookmark: "Salva",

  widget_who_to_follow: "Chi seguire",
  widget_near_you: "Vicino a te",
  widget_view_map: "Vedi mappa",
  widget_follow: "Segui",
  widget_interested: "Interessato 🙋",
  widget_see_more: "Altri suggerimenti →",
  widget_view_map_arrow: "Apri mappa →",

  qa_box_title: "Accesso Rapido",
  qa_box_subtitle: "Tocca per visitare · Tocca di nuovo per fissare",
  qa_box_pinned: "Fissato",
  qa_box_all: "Tutte le funzioni",
  qa_box_add: "Aggiungi scorciatoia",
  qa_box_all_pinned: "Tutte le funzioni fissate!",

  cal_has_events: "Eventi in programma",
  cal_today: "Oggi",
  cal_no_events: "Nessun evento in questo giorno",
  cal_no_events_hint: "I giorni con punto blu hanno eventi comunitari.",
  cal_back: "Torna al Feed",

  empty_following: "Non segui ancora nessuno",
  empty_following_sub: "Segui le persone per vedere i loro post qui",
  empty_local: "Ancora nessun post locale",
  empty_local_sub: "I post della tua zona appariranno qui",

  following_banner: "Ultimi post delle persone che segui",

  weather_feels: "Percepita",
  weather_wind: "Vento",
  weather_humidity: "Umidità",
  weather_high: "Max",
  weather_low: "Min",
  weather_loading: "Caricamento meteo...",
  weather_locating: "Rilevamento posizione...",
  weather_error: "Impossibile caricare il meteo",
  weather_allow: "Consenti posizione",

  switch_language: "Cambia lingua",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "Portale paese attivo",
};

const ms: TranslationMap = {
  home: "Laman Utama",
  search: "Terokai",
  explore: "Terokai",
  map: "Peta",
  services: "Perkhidmatan",
  reels: "Reels",
  orders: "Pesanan",
  more: "Lagi",
  communities: "Komuniti",
  messages: "Mesej",
  notifications: "Pemberitahuan",
  profile: "Profil",
  saved: "Disimpan",
  qa: "Soal Jawab",
  settings: "Tetapan",
  admin: "Pentadbir",
  seller: "Portal Peniaga",

  admin_desc: "Panel pentadbiran & moderasi",
  qa_desc: "Soalan dan nasihat komuniti",
  saved_desc: "Sumber dan penanda buku anda",
  settings_desc: "Keutamaan akaun & aplikasi",

  tab_foryou: "Untuk Anda",
  tab_following: "Mengikuti",
  tab_map: "Peta",
  tab_local: "Tempatan",

  post_type_question: "Tanya",
  post_type_tip: "Tip",
  post_type_need_help: "Bantuan",
  post_placeholder_default: "Apa yang anda fikirkan?",
  post_placeholder_question: "Tanya komuniti sesuatu...",
  post_placeholder_tip: "Kongsi tip tempatan yang berguna...",
  post_placeholder_need_help: "Nyatakan bantuan yang anda perlukan...",
  post_btn: "Hantar",

  label_emergency: "Amaran Kecemasan",
  label_question: "Tanya Komuniti",
  label_tip: "Tip Tempatan",
  label_need_help: "Perlu Bantuan",
  label_announcement: "Pengumuman Komuniti",
  label_achievement: "Pencapaian",
  label_poll: "Undian Komuniti",

  action_comment: "Komen",
  action_repost: "Kongsi Semula",
  action_share: "Kongsi",
  action_bookmark: "Simpan",

  widget_who_to_follow: "Siapa untuk Diikuti",
  widget_near_you: "Berhampiran Anda",
  widget_view_map: "Lihat peta",
  widget_follow: "Ikuti",
  widget_interested: "Berminat 🙋",
  widget_see_more: "Lihat lebih banyak cadangan →",
  widget_view_map_arrow: "Buka peta →",

  qa_box_title: "Akses Pantas",
  qa_box_subtitle: "Ketik untuk lawati · Ketik lagi untuk pin",
  qa_box_pinned: "Disemat",
  qa_box_all: "Semua Ciri",
  qa_box_add: "Tambah Pintasan",
  qa_box_all_pinned: "Semua ciri telah disemat!",

  cal_has_events: "Ada acara",
  cal_today: "Hari Ini",
  cal_no_events: "Tiada acara pada hari ini",
  cal_no_events_hint: "Tarikh bertitik biru mempunyai acara komuniti.",
  cal_back: "Kembali ke Suapan",

  empty_following: "Belum mengikuti sesiapa lagi",
  empty_following_sub: "Ikuti orang lain untuk melihat hantaran mereka di sini",
  empty_local: "Belum ada hantaran tempatan",
  empty_local_sub: "Hantaran dari kawasan anda akan dipaparkan di sini",

  following_banner: "Memaparkan hantaran terkini daripada individu yang anda ikuti",

  weather_feels: "Terasa seperti",
  weather_wind: "Angin",
  weather_humidity: "Kelembapan",
  weather_high: "Tinggi",
  weather_low: "Rendah",
  weather_loading: "Memuatkan cuaca...",
  weather_locating: "Mengesan lokasi...",
  weather_error: "Gagal memuatkan cuaca",
  weather_allow: "Benarkan lokasi",

  switch_language: "Tukar Bahasa",
  lang_en: "English",
  lang_bn: "বাংলা",
  lang_de: "Deutsch",
  lang_fr: "Français",
  lang_es: "Español",
  lang_ar: "العربية",
  lang_ja: "日本語",
  lang_it: "Italiano",
  lang_ms: "Bahasa Melayu",
  country_portal_active: "Portal negara aktif",
};

const translations: Record<Lang, TranslationMap> = {
  en,
  bn,
  de,
  fr,
  es,
  ar,
  ja,
  it,
  ms,
};
