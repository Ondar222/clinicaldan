import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ServiceGrid from "./components/ServiceGrid";
import Advantages from "./components/Advantages";
import Testimonials from "./components/Testimonials";
import ContactForm from "./components/ContactForm";
import Checkups from "./components/Checkups";
import CheckupCenterPage from "./components/CheckupCenterPage";
import News from "./components/News";
import Tools from "./components/Tools";
import DoctorsPage from "./components/DoctorsPage";
import NewsPage from "./components/NewsPage";
import DoctorDetailsPage from "./components/DoctorDetailsPage";
import ReviewsPage from "./components/ReviewsPage";
import PromotionsPage from "./components/PromotionsPage";
import ContactsPage from "./components/ContactsPage";
import FAQPage from "./components/FAQPage";
import AboutClinicPage from "./components/AboutClinicPage";
import DocumentsPage from "./components/DocumentsPage";
import MedicalExaminationsPage from "./components/MedicalExaminationsPage";
import ToolsPage from "./components/ToolsPage";
import DirectionsPage from "./components/DirectionsPage";
// Временно скрыто - компоненты сертификатов и записи на прием
// import GiftCertificatesPage from "./components/GiftCertificatesPage";
import PriceListPage from "./components/PriceListPage";
import GiftCertificatesPage from "./components/GiftCertificatesPage";
import PaymentSuccessPage from "./components/PaymentSuccessPage";
import PaymentCancelPage from "./components/PaymentCancelPage";
import PaymentFailedPage from "./components/PaymentFailedPage";
import ServicePage from "./components/ServicePage";
import StaffDashboard from "./components/StaffDashboard";
import NotFoundPage from "./components/NotFoundPage";
import archimedService from "./services/archimed";
import ScrollToTop from "./components/ScrollToTop";
import CookieNotification from "./components/CookieNotification";
import CookiePolicyPage from "./components/CookiePolicyPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import FloatingBooking from "./components/FloatingBooking";
import ToolDetailsPage from "./components/ToolDetailsPage";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import VkPostDetailPage from "./components/VkPostDetailPage";
import CosmetologyPage from "./components/CosmetologyPage";
import CosmetologyServicePage from "./components/CosmetologyServicePage";
// Временно скрыто - личный кабинет и платежи
// import PatientCabinetPage from "./components/PatientCabinetPage";
// import PaymentSuccessPage from "./components/PaymentSuccessPage";
// import PaymentCancelPage from "./components/PaymentCancelPage";
// import PaymentTestPage from "./components/PaymentTestPage";
// import PaymentDiagnosticPage from "./components/PaymentDiagnosticPage";
// import PaymentMonitorPage from "./components/PaymentMonitorPage";

function HomePage() {
  return (
    <>
      <Hero />
      <ServiceGrid />
      <News limit={5} showPagination={false} />
      <Checkups />
      <Advantages />
      <Testimonials />
      <ContactForm />
      <Tools />
    </>
  );
}

function App() {
  useEffect(() => {
    // Prefetch doctors and services for instant navigation to directions
    archimedService.prefetchAll();
  }, []);

  const handleCookieAccept = () => {
    // Здесь можно добавить логику для инициализации аналитики и других сервисов
    console.log("Cookies accepted");
  };

  const handleCookieDecline = () => {
    // Здесь можно добавить логику для отключения аналитики
    console.log("Cookies declined");
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <RouteErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutClinicPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
            <Route path="/medical-examinations" element={<MedicalExaminationsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/stock" element={<PromotionsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/questions" element={<FAQPage />} />
            <Route path="/directions" element={<DirectionsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/certificates" element={<GiftCertificatesPage />} />
            <Route path="/checkups" element={<CheckupCenterPage />} />
            <Route
              path="/certificates/success"
              element={<PaymentSuccessPage type="certificate" />}
            />
            <Route
              path="/certificates/cancel"
              element={<PaymentCancelPage />}
            />
            <Route
              path="/payment-failed"
              element={<PaymentFailedPage />}
            />
            {/* Временно скрыто - маршруты сертификатов и записи на прием
            
            
            */}
            <Route path="/prices" element={<PriceListPage />} />
            <Route path="/services/cosmetology" element={<CosmetologyPage />} />
            <Route path="/services/cosmetology/:category" element={<CosmetologyPage />} />
            <Route path="/services/cosmetology/:category/:serviceSlug" element={<CosmetologyServicePage />} />
            <Route path="/services/:slug" element={<ServicePage />} />
            <Route path="/tools/:id" element={<ToolDetailsPage />} />
            <Route path="/vk-post/:id" element={<VkPostDetailPage />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* Временно скрыто - личный кабинет и платежи
            <Route path="/personal-cabinet" element={<PatientCabinetPage />} />
            <Route path="/payment-test" element={<PaymentTestPage />} />
            <Route
              path="/payment-test/success"
              element={<PaymentSuccessPage type="appointment" />}
            />
            <Route
              path="/payment-test/cancel"
              element={<PaymentCancelPage />}
            />
            <Route
              path="/payment-diagnostic"
              element={<PaymentDiagnosticPage />}
            />
            <Route path="/payment-monitor" element={<PaymentMonitorPage />} />
            */}
          </Routes>
          </RouteErrorBoundary>
        </main>
        <Footer />
        <FloatingBooking />
        <CookieNotification
          onAccept={handleCookieAccept}
          onDecline={handleCookieDecline}
        />
      </div>
    </Router>
  );
}

export default App;
