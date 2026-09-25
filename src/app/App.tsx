/* MARKER-MAKE-KIT-INVOKED */
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LanguageProvider } from "./context/LanguageContext";
import { MobileTabProvider } from "./context/MobileTabContext";
import { AppSplash } from "./pages/AppSplash";
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
import { Jobs, Housing, FreeFood, LegalHelp, ImmigrationChecklist, Embassy } from "./pages/ServicePages";
import { SchoolFinder, HospitalFinder, ReligiousFinder, RestaurantGroceryFinder } from "./pages/MoreServicePages";
import {
  HalalFoodServicePage,
  LegalAidServicePage,
  HospitalServicePage,
  PharmacyServicePage,
  FreeMedicineServicePage,
  SocialAidServicePage,
  GasEVServicePage,
  SportsServicePage,
  SchoolServicePage,
  TransitServicePage,
  GroceryShopServicePage,
  FurnitureServicePage,
  MoneyExchangeServicePage,
  TravelFlightServicePage,
  CarsAutoServicePage,
  ElectronicsServicePage,
} from "./pages/ServiceDirectoryPages";
import { ServiceDetail } from "./pages/ServiceDetail";
import { PostDetails } from "./pages/PostDetails";
import { SavedResources } from "./pages/SavedResources";
import { Settings } from "./pages/Settings";
import { Admin } from "./pages/Admin";
import { Reels } from "./pages/Reels";
import { SellerDashboard } from "./pages/SellerDashboard";
import { SellerProfile } from "./pages/SellerProfile";
import { MoreMenu } from "./pages/MoreMenu";
import { BuyerOrders } from "./pages/BuyerOrders";
import { PWAInstallPrompt } from "./components/ui/PWAInstallPrompt";
import { AccountModeProvider } from "./context/AccountModeContext";
import { SellerMigrationModal } from "./components/seller/SellerMigrationModal";
import { GlobalDollAssistant } from "./components/ai/PathaSathiDollAssistant";
import { AutoFavouriteTracker } from "./components/tracker/AutoFavouriteTracker";

// Admin OS RBAC System Imports
import { CountryPlatformProvider } from "./context/CountryPlatformContext";
import { AdminRoleProvider } from "./context/AdminRoleContext";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminRoleGuard } from "./pages/admin/AdminRoleGuard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCountryLaunchpad } from "./pages/admin/roles/super-admin/AdminCountryLaunchpad";
import { SuperAdminOverview } from "./pages/admin/roles/super-admin/SuperAdminOverview";
import { AdminRoleManagement } from "./pages/admin/roles/super-admin/AdminRoleManagement";
import { AdminFeatureFlags } from "./pages/admin/roles/super-admin/AdminFeatureFlags";
import { AdminAuditLogs } from "./pages/admin/roles/super-admin/AdminAuditLogs";
import { ModerationQueue } from "./pages/admin/roles/moderator/ModerationQueue";
import { AiFlaggedContent } from "./pages/admin/roles/moderator/AiFlaggedContent";
import { VerificationQueue } from "./pages/admin/roles/verifier/VerificationQueue";
import { BadgeManagement } from "./pages/admin/roles/verifier/BadgeManagement";
import { SellerApprovals } from "./pages/admin/roles/marketplace/SellerApprovals";
import { ProductModeration } from "./pages/admin/roles/marketplace/ProductModeration";
import { DirectoryManagement } from "./pages/admin/roles/resources/DirectoryManagement";
import { EmergencyBroadcasts } from "./pages/admin/roles/resources/EmergencyBroadcasts";
import { SupportTickets } from "./pages/admin/roles/support/SupportTickets";
import { UserLookup } from "./pages/admin/roles/support/UserLookup";
import { AdsProvider } from "./context/AdsContext";
import { AdminAdsManager } from "./pages/admin/roles/marketplace/AdminAdsManager";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AutoFavouriteTracker />
        <AccountModeProvider>
          <CountryPlatformProvider>
            <AdminRoleProvider>
              <AdsProvider>
                <MobileTabProvider>
                <PWAInstallPrompt />
                <SellerMigrationModal />
                <GlobalDollAssistant />
                <Routes>
              {/* Public */}
            <Route path="/" element={<AppSplash />} />
            <Route path="/landing" element={<Landing />} />
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
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/user/:username" element={<Profile />} />
            <Route path="/orders" element={<BuyerOrders />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/qa" element={<QandA />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/saved" element={<SavedResources />} />
            <Route path="/more" element={<MoreMenu />} />

            {/* Seller SaaS & Storefront */}
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller/:sellerId" element={<SellerProfile />} />
            <Route path="/store/:storeId" element={<SellerProfile />} />

            {/* Service Pages (Interactive Map Directory Standard) */}
            <Route path="/services/jobs" element={<Jobs />} />
            <Route path="/services/housing" element={<Housing />} />
            <Route path="/services/free-food" element={<FreeFood />} />
            <Route path="/services/food-bank" element={<FreeFood />} />
            <Route path="/services/embassy" element={<Embassy />} />
            <Route path="/services/consulate" element={<Embassy />} />
            <Route path="/services/legal" element={<LegalAidServicePage />} />
            <Route path="/services/legal-aid" element={<LegalAidServicePage />} />
            <Route path="/services/home-kitchen" element={<HalalFoodServicePage />} />
            <Route path="/services/halal-food" element={<HalalFoodServicePage />} />
            <Route path="/services/community-hospital" element={<HospitalServicePage />} />
            <Route path="/services/hospitals" element={<HospitalServicePage />} />
            <Route path="/services/pharmacy" element={<PharmacyServicePage />} />
            <Route path="/services/free-medicine" element={<FreeMedicineServicePage />} />
            <Route path="/services/social-services" element={<SocialAidServicePage />} />
            <Route path="/services/social-aid" element={<SocialAidServicePage />} />
            <Route path="/services/petrol" element={<GasEVServicePage />} />
            <Route path="/services/gas" element={<GasEVServicePage />} />
            <Route path="/services/sports" element={<SportsServicePage />} />
            <Route path="/services/checklist" element={<ImmigrationChecklist />} />
            <Route path="/services/schools" element={<SchoolServicePage />} />
            <Route path="/services/education" element={<SchoolServicePage />} />
            <Route path="/services/admission" element={<SchoolServicePage />} />
            <Route path="/services/subway" element={<TransitServicePage />} />
            <Route path="/services/metro" element={<TransitServicePage />} />
            <Route path="/services/transit" element={<TransitServicePage />} />
            <Route path="/services/shops" element={<GroceryShopServicePage />} />
            <Route path="/services/local-shops" element={<GroceryShopServicePage />} />
            <Route path="/services/grocery" element={<GroceryShopServicePage />} />
            <Route path="/services/used-furniture" element={<FurnitureServicePage />} />
            <Route path="/services/furniture" element={<FurnitureServicePage />} />
            <Route path="/services/money-exchange" element={<MoneyExchangeServicePage />} />
            <Route path="/services/remittance" element={<MoneyExchangeServicePage />} />
            <Route path="/services/travel-agency" element={<TravelFlightServicePage />} />
            <Route path="/services/travel" element={<TravelFlightServicePage />} />
            <Route path="/services/flights" element={<TravelFlightServicePage />} />
            <Route path="/services/cars" element={<CarsAutoServicePage />} />
            <Route path="/services/electronics" element={<ElectronicsServicePage />} />
            <Route path="/services/religious" element={<ReligiousFinder />} />
            <Route path="/services/religion" element={<ReligiousFinder />} />
            <Route path="/services/food" element={<HalalFoodServicePage />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />

            {/* Reels */}
            <Route path="/reels" element={<Reels />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* PathaSathi Admin OS (Role-Based Access Control) */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            
            {/* Super Admin Routes */}
            <Route path="/admin/countries" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_countries"><AdminCountryLaunchpad /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/system-health" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_system"><SuperAdminOverview /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/staff-roles" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_roles"><AdminRoleManagement /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/feature-flags" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_flags"><AdminFeatureFlags /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/audit-logs" element={<AdminLayout><AdminRoleGuard requiredPermission="view_audit_logs"><AdminAuditLogs /></AdminRoleGuard></AdminLayout>} />

            {/* Trust & Safety Moderator Routes */}
            <Route path="/admin/moderation" element={<AdminLayout><AdminRoleGuard requiredPermission="moderate_content"><ModerationQueue /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/ai-flags" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_ai_flags"><AiFlaggedContent /></AdminRoleGuard></AdminLayout>} />

            {/* Verification Officer Routes */}
            <Route path="/admin/verifications" element={<AdminLayout><AdminRoleGuard requiredPermission="verify_credentials"><VerificationQueue /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/badges" element={<AdminLayout><AdminRoleGuard requiredPermission="grant_badges"><BadgeManagement /></AdminRoleGuard></AdminLayout>} />

            {/* Marketplace Admin Routes */}
            <Route path="/admin/sellers" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_sellers"><SellerApprovals /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout><AdminRoleGuard requiredPermission="moderate_products"><ProductModeration /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/ads" element={<AdminLayout><AdminRoleGuard requiredPermission="manage_ads"><AdminAdsManager /></AdminRoleGuard></AdminLayout>} />

            {/* Resource & Map Directory Editor Routes */}
            <Route path="/admin/directory" element={<AdminLayout><AdminRoleGuard requiredPermission="edit_directory"><DirectoryManagement /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/broadcasts" element={<AdminLayout><AdminRoleGuard requiredPermission="send_broadcasts"><EmergencyBroadcasts /></AdminRoleGuard></AdminLayout>} />

            {/* Support Agent Routes */}
            <Route path="/admin/tickets" element={<AdminLayout><AdminRoleGuard requiredPermission="handle_tickets"><SupportTickets /></AdminRoleGuard></AdminLayout>} />
            <Route path="/admin/user-lookup" element={<AdminLayout><AdminRoleGuard requiredPermission="lookup_users"><UserLookup /></AdminRoleGuard></AdminLayout>} />

            {/* Legacy Admin Prototype (Preserved) */}
            <Route path="/admin/legacy" element={<Admin />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
                </MobileTabProvider>
              </AdsProvider>
            </AdminRoleProvider>
          </CountryPlatformProvider>
        </AccountModeProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
