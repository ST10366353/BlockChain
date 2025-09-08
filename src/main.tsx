import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AuthProvider } from "@/contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <ToastProvider>
          <OfflineIndicator />
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </AuthProvider>
  </StrictMode>
);
