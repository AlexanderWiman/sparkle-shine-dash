import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookingForm from "./pages/BookingForm";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import BookingManagement from "./pages/BookingManagement";
import FacilityView from "./pages/FacilityView";
import FacilityManagement from "./pages/FacilityManagement";
import FacilityEdit from "./pages/FacilityEdit";
import OfferManagement from "./pages/OfferManagement";
import ScheduledNotifications from "./pages/ScheduledNotifications";
import UserManagement from "./pages/UserManagement";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PublicBooking from "./pages/PublicBooking";
import EmbedBooking from "./pages/EmbedBooking";
import LandingCMS from "./pages/LandingCMS";
import PressPage from "./pages/PressPage";
import TodoList from "./pages/TodoList";
import BiltvattBorlange from "./pages/BiltvattBorlange";
import BiltvattKupolen from "./pages/BiltvattKupolen";
import PartnerManagement from "./pages/PartnerManagement";
import PartnerDocs from "./pages/PartnerDocs";
import InvestorsPage from "./pages/InvestorsPage";
import SeoDashboard from "./pages/SeoDashboard";
import Customers from "./pages/Customers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/boka" element={<PublicBooking />} />
            <Route path="/boka/embed" element={<EmbedBooking />} />
            <Route path="/priser" element={<PricingPage />} />
            <Route path="/om" element={<AboutPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/biltvatt-borlange" element={<BiltvattBorlange />} />
            <Route path="/biltvatt-kupolen" element={<BiltvattKupolen />} />
            <Route path="/investors" element={<InvestorsPage />} />
            
            {/* Protected admin routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
            <Route path="/facilities" element={<ProtectedRoute><FacilityManagement /></ProtectedRoute>} />
            <Route path="/facility/:facilityId" element={<ProtectedRoute><FacilityView /></ProtectedRoute>} />
            <Route path="/facility/:facilityId/edit" element={<ProtectedRoute><FacilityEdit /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute><OfferManagement /></ProtectedRoute>} />
            <Route path="/scheduled-notifications" element={<ProtectedRoute><ScheduledNotifications /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/landing-cms" element={<ProtectedRoute><LandingCMS /></ProtectedRoute>} />
            <Route path="/todos" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
            <Route path="/partners" element={<ProtectedRoute requireRole="admin"><PartnerManagement /></ProtectedRoute>} />
            <Route path="/seo" element={<ProtectedRoute requireRole="admin"><SeoDashboard /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            {/* Public partner API docs - shareable link, no login required */}
            <Route path="/partners/docs" element={<PartnerDocs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
