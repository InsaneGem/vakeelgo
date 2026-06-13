import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CallNotificationProvider } from "@/components/consultation/CallNotificationProvider";
import { BookingNotificationProvider } from "@/components/lawyers/BookingNotification";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Lawyers from "./pages/Lawyers";
import LawyerProfile from "./pages/LawyerProfile";
import LawyerEarnings from "./pages/dashboard/LawyerEarnings";
import LawyerConsultations from "./pages/dashboard/LawyerConsultations";
import LawyerRating from "./pages/dashboard/LawyerRating";
import LawyerPendingRequests from "./pages/dashboard/LawyerPendingRequests";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import ClientManageAccount from "./pages/ClientManageAccount";
import KnowYourRights from "./pages/KnowYourRights";
import LegalGuides from "./pages/LegalGuides";
import LegalAid from "./pages/LegalAid";
import ConsumerProtection from "./pages/ConsumerProtection";
import LawyerDashboard from "./pages/dashboard/LawyerDashboard";
import LawyerOnboarding from "./pages/dashboard/LawyerOnboarding";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import LawyerManageAccount from "./pages/dashboard/LawyerManageAccount";
import Consultation from "./pages/Consultation";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/LawyerCategories";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import LegalUpdates from "./pages/LegalUpdates";
import Blog from "./pages/Blog";
import Articles from "./pages/Articles";
import Pricing from "./pages/Pricing";
import ClientLawyerDetail from "./pages/ClientLawyerDetail";
import ConsultationHistory from "./pages/dashboard/ClientConsultationhistory";
import SavedLawyers from "./pages/SavedLawyers";
import ClientActiveSessions from "./pages/dashboard/ClientActiveSessions";
import ClientProcessing from "./pages/dashboard/ClientProcessing";
import ClientPayments from "./pages/dashboard/ClientPayments";
import ClientTransactionHistory from "./pages/dashboard/ClientTransactionHistory";
import ClientRecordings from "./pages/dashboard/ClientRecordings";
import LawyerActiveSessions from "./pages/dashboard/LawyerActiveSessions";
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { LawyerLayout } from '@/components/layout/LawyerLayout';
import Benefits from "./pages/Benefits";
import AboutUs from "./pages/AboutUs";
import { ScrollToTop } from './contexts/ScrollToTop';

import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminClientPage from "@/components/admin/AdminClientPage"
import AdminLawyerPage from "@/components/admin/AdminLawyerPage"
import AdminLawyerVerificationPage from "@/components/admin/AdminLawyerVerificationPage"
import AdminConsulationPage from "@/components/admin/AdminConsulationPage"
import AdminDocumentVerificationPage from "@/components/admin/AdminDocumentVerificationPage"
import AdminClientLawyerTransactionPage from "@/components/admin/AdminClientLawyerTransactionPage"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 text-center text-xs sm:text-sm font-medium py-1 px-1">
        ⚠️ This website is under process!
      </div> */}
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CallNotificationProvider>
            <BookingNotificationProvider>
              <Routes>


                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />




                <Route path="/lawyer/profile-setup" element={<LawyerOnboarding />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="/lawyersCard/:id" element={<ClientLawyerDetail />} />
                <Route path="/consultation-history" element={<ConsultationHistory />} />
                <Route path="/consultation/:id" element={<Consultation />} />




                // ==============================
                // PUBLIC MAINLAYOUT ROUTES
                // ==============================

                <Route path="/legal-guides" element={<MainLayout><LegalGuides /></MainLayout>} />
                <Route path="/know-your-rights" element={<MainLayout><KnowYourRights /></MainLayout>} />
                <Route path="/legal-aid" element={<MainLayout><LegalAid /></MainLayout>} />
                <Route path="/consumer-protection" element={<MainLayout><ConsumerProtection /></MainLayout>} />
                <Route path="/help" element={<MainLayout><Help /></MainLayout>} />
                <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />
                <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
                <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
                <Route path="/refund" element={<MainLayout><Refund /></MainLayout>} />
                <Route path="/how-it-works" element={<MainLayout><HowItWorks /></MainLayout>} />
                <Route path="/categories" element={<MainLayout><Categories /></MainLayout>} />
                <Route path="/legal-updates" element={<MainLayout><LegalUpdates /></MainLayout>} />
                <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
                <Route path="/articles" element={<MainLayout><Articles /></MainLayout>} />
                <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
                <Route path="/benefits" element={<MainLayout><Benefits /></MainLayout>} />
                <Route path="/aboutus" element={<MainLayout><AboutUs /></MainLayout>} />

//                ==============================
                // CLIENTLAYOUT ROUTES
                // ==============================

                <Route path="/client/legal-guides" element={<ClientLayout><LegalGuides /></ClientLayout>} />
                <Route path="/client/know-your-rights" element={<ClientLayout><KnowYourRights /></ClientLayout>} />
                <Route path="/client/legal-aid" element={<ClientLayout><LegalAid /></ClientLayout>} />
                <Route path="/client/consumer-protection" element={<ClientLayout><ConsumerProtection /></ClientLayout>} />
                <Route path="/client/help" element={<ClientLayout><Help /></ClientLayout>} />
                <Route path="/client/faq" element={<ClientLayout><FAQ /></ClientLayout>} />
                <Route path="/client/contact" element={<ClientLayout><Contact /></ClientLayout>} />
                <Route path="/client/privacy" element={<ClientLayout><Privacy /></ClientLayout>} />
                <Route path="/client/terms" element={<ClientLayout><Terms /></ClientLayout>} />
                <Route path="/client/refund" element={<ClientLayout><Refund /></ClientLayout>} />
                <Route path="/client/how-it-works" element={<ClientLayout><HowItWorks /></ClientLayout>} />
                <Route path="/client/categories" element={<ClientLayout><Categories /></ClientLayout>} />
                <Route path="/client/legal-updates" element={<ClientLayout><LegalUpdates /></ClientLayout>} />
                <Route path="/client/blog" element={<ClientLayout><Blog /></ClientLayout>} />
                <Route path="/client/articles" element={<ClientLayout><Articles /></ClientLayout>} />
                <Route path="/client/pricing" element={<ClientLayout><Pricing /></ClientLayout>} />
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/manage-account" element={<ClientManageAccount />} />
                <Route path="/saved-lawyers" element={<SavedLawyers />} />
                <Route path="/client/active-sessions" element={<ClientActiveSessions />} />
                <Route path="/dashboard/processing" element={<ClientProcessing />} />
                <Route path="/dashboard/payments" element={<ClientPayments />} />
                <Route path="/dashboard/transactions" element={<ClientTransactionHistory />} />
                <Route path="/dashboard/recordings" element={<ClientRecordings />} />

// ==============================
                // LAWYERLAYOUT ROUTES
                // ==============================

                <Route path="/lawyer/legal-guides" element={<LawyerLayout><LegalGuides /></LawyerLayout>} />
                <Route path="/lawyer/know-your-rights" element={<LawyerLayout><KnowYourRights /></LawyerLayout>} />
                <Route path="/lawyer/legal-aid" element={<LawyerLayout><LegalAid /></LawyerLayout>} />
                <Route path="/lawyer/consumer-protection" element={<LawyerLayout><ConsumerProtection /></LawyerLayout>} />
                <Route path="/lawyer/help" element={<LawyerLayout><Help /></LawyerLayout>} />
                <Route path="/lawyer/faq" element={<LawyerLayout><FAQ /></LawyerLayout>} />
                <Route path="/lawyer/contact" element={<LawyerLayout><Contact /></LawyerLayout>} />
                <Route path="/lawyer/privacy" element={<LawyerLayout><Privacy /></LawyerLayout>} />
                <Route path="/lawyer/terms" element={<LawyerLayout><Terms /></LawyerLayout>} />
                <Route path="/lawyer/refund" element={<LawyerLayout><Refund /></LawyerLayout>} />
                <Route path="/lawyer/how-it-works" element={<LawyerLayout><HowItWorks /></LawyerLayout>} />
                <Route path="/lawyer/categories" element={<LawyerLayout><Categories /></LawyerLayout>} />
                <Route path="/lawyer/legal-updates" element={<LawyerLayout><LegalUpdates /></LawyerLayout>} />
                <Route path="/lawyer/blog" element={<LawyerLayout><Blog /></LawyerLayout>} />
                <Route path="/lawyer/articles" element={<LawyerLayout><Articles /></LawyerLayout>} />
                <Route path="/lawyer/pricing" element={<LawyerLayout><Pricing /></LawyerLayout>} />
                <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
                <Route path="/lawyer/manage-account" element={<LawyerManageAccount />} />
                <Route path="/lawyers" element={<Lawyers />} />
                <Route path="/lawyer/:id" element={<LawyerProfile />} />
                <Route path="/lawyer/earnings" element={<LawyerEarnings />} />
                <Route path="/lawyer/consultations" element={<LawyerConsultations />} />
                <Route path="/lawyer/rating" element={<LawyerRating />} />
                <Route path="/lawyer/pending-requests" element={<LawyerPendingRequests />} />
                <Route path="/dashboard/lawyer-active-sessions" element={<LawyerActiveSessions />} />


                // ==============================
                // ADMIN ROUTES
                // ==============================
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/clientPage" element={<AdminClientPage />} />
                <Route path="/admin/lawyerPage" element={<AdminLawyerPage />} />
                <Route path="/admin/lawyerverificationPage" element={<AdminLawyerVerificationPage />} />
                <Route path="/admin/consultationPage" element={<AdminConsulationPage />} />
                <Route path="/admin/documentverificationPage" element={<AdminDocumentVerificationPage />} />
                <Route path="/admin/AdminClientLawyerTransactionPage" element={<AdminClientLawyerTransactionPage />} />















                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BookingNotificationProvider>
          </CallNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
