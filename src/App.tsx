import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import EnterpriseDashboard from "@/pages/EnterpriseDashboard";
import PowerUserDashboard from "@/pages/PowerUserDashboard";
import Credentials from "@/pages/Credentials";
import AddCredential from "@/pages/AddCredential";
import CredentialDetails from "@/pages/CredentialDetails";
import HandshakeRequests from "@/pages/HandshakeRequests";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import AuditTrail from "@/pages/AuditTrail";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ModalProvider } from "@/components/ModalProvider";

export default function App() {
  return (
    <Router>
      <ModalProvider />
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Consumer Routes - Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/consumer/credentials" element={
          <ProtectedRoute>
            <Credentials isEnterprise={false} />
          </ProtectedRoute>
        } />
        <Route path="/consumer/credentials/add" element={
          <ProtectedRoute>
            <AddCredential />
          </ProtectedRoute>
        } />
        <Route path="/consumer/credentials/:id" element={
          <ProtectedRoute>
            <CredentialDetails />
          </ProtectedRoute>
        } />
        <Route path="/consumer/requests" element={
          <ProtectedRoute>
            <HandshakeRequests isEnterprise={false} />
          </ProtectedRoute>
        } />
        <Route path="/consumer/settings" element={
          <ProtectedRoute>
            <Settings isEnterprise={false} />
          </ProtectedRoute>
        } />

        {/* Enterprise Routes - Protected */}
        <Route path="/enterprise/dashboard" element={
          <ProtectedRoute requiredUserType="enterprise">
            <EnterpriseDashboard />
          </ProtectedRoute>
        } />
        <Route path="/enterprise/credentials" element={
          <ProtectedRoute requiredUserType="enterprise">
            <Credentials isEnterprise={true} />
          </ProtectedRoute>
        } />
        <Route path="/enterprise/verifications" element={
          <ProtectedRoute requiredUserType="enterprise">
            <HandshakeRequests isEnterprise={true} />
          </ProtectedRoute>
        } />
        <Route path="/enterprise/settings" element={
          <ProtectedRoute requiredUserType="enterprise">
            <Settings isEnterprise={true} />
          </ProtectedRoute>
        } />
        <Route path="/enterprise/audit" element={
          <ProtectedRoute requiredUserType="enterprise">
            <AuditTrail />
          </ProtectedRoute>
        } />

        {/* Power User Routes - Protected */}
        <Route path="/power-user/dashboard" element={
          <ProtectedRoute requiredUserType="power-user">
            <PowerUserDashboard />
          </ProtectedRoute>
        } />

        {/* Shared Routes - Protected */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
