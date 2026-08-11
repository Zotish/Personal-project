/* MARKER-MAKE-KIT-INVOKED */
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LanguageProvider } from "./context/LanguageContext";
import { Landing } from "./pages/Landing";
import { Login, SignUp, EmailVerification } from "./pages/Auth";
import {
  OnboardingCountry,
  OnboardingStatus,
  OnboardingLanguage,
  OnboardingTopics,
  OnboardingPeople,
  OnboardingCommunities,
} from "./pages/Onboarding";
import { HomeFeed } from "./pages/HomeFeed";
import { Explore } from "./pages/Explore";
import { MapDiscovery } from "./pages/MapDiscovery";
import { ServicesHub } from "./pages/ServicesHub";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";
import { Communities } from "./pages/Communities";
import { QandA } from "./pages/QandA";
import { Jobs, Housing, LegalHelp, ImmigrationChecklist } from "./pages/ServicePages";
import { SchoolFinder, HospitalFinder, ReligiousFinder, RestaurantGroceryFinder } from "./pages/MoreServicePages";
import { ServiceDetail } from "./pages/ServiceDetail";
import { PostDetails } from "./pages/PostDetails";
import { SavedResources } from "./pages/SavedResources";
import { Settings } from "./pages/Settings";
import { Admin } from "./pages/Admin";
import { Reels } from "./pages/Reels";
import { SellerDashboard } from "./pages/SellerDashboard";
import { SellerProfile } from "./pages/SellerProfile";
import { MoreMenu } from "./pages/MoreMenu";

export default function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Onboarding (6 steps) */}
        <Route path="/onboarding/country" element={<OnboardingCountry />} />
        <Route path="/onboarding/status" element={<OnboardingStatus />} />
        <Route path="/onboarding/language" element={<OnboardingLanguage />} />
        <Route path="/onboarding/topics" element={<OnboardingTopics />} />
        <Route path="/onboarding/people" element={<OnboardingPeople />} />
        <Route path="/onboarding/communities" element={<OnboardingCommunities />} />

        {/* Main App */}
        <Route path="/feed" element={<HomeFeed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/map" element={<MapDiscovery />} />
        <Route path="/services" element={<ServicesHub />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/qa" element={<QandA />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/saved" element={<SavedResources />} />
        <Route path="/more" element={<MoreMenu />} />

        {/* Seller SaaS & Storefront */}
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller/:sellerId" element={<SellerProfile />} />
        <Route path="/store/:storeId" element={<SellerProfile />} />

        {/* Service Pages */}
        <Route path="/services/jobs" element={<Jobs />} />
        <Route path="/services/housing" element={<Housing />} />
        <Route path="/services/legal" element={<LegalHelp />} />
        <Route path="/services/checklist" element={<ImmigrationChecklist />} />
        <Route path="/services/schools" element={<SchoolFinder />} />
        <Route path="/services/hospitals" element={<HospitalFinder />} />
        <Route path="/services/religious" element={<ReligiousFinder />} />
        <Route path="/services/food" element={<RestaurantGroceryFinder />} />
        <Route path="/services/:serviceId" element={<ServiceDetail />} />

        {/* Reels */}
        <Route path="/reels" element={<Reels />} />

        {/* Settings & Admin */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}
