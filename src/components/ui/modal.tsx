import { useEffect, createContext, useContext, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Base Modal Context
interface ModalContextType {
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a Modal");
  }
  return context;
}

// Base Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalContext.Provider value={{ closeModal: onClose }}>
          {children}
        </ModalContext.Provider>
      </div>
    </div>
  );
}

// Modal Header
interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  const { closeModal } = useModal();

  return (
    <div className={cn("flex items-center justify-between p-6 border-b", className)}>
      <div className="flex-1">{children}</div>
      <button
        onClick={closeModal}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}

// Modal Title
interface ModalTitleProps {
  children: ReactNode;
  className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h2>
  );
}

// Modal Description
interface ModalDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-600 mt-1", className)}>
      {children}
    </p>
  );
}

// Modal Content
interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={cn("p-6 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

// Modal Footer
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn("flex justify-end space-x-3 p-6 border-t bg-gray-50", className)}>
      {children}
    </div>
  );
}

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmationModalProps) {
  const getConfirmButtonColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>

      {description && (
        <ModalContent>
          <ModalDescription>{description}</ModalDescription>
        </ModalContent>
      )}

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            "px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
            getConfirmButtonColor(),
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}

// Credential Details Modal
interface CredentialDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential?: any;
}

export function CredentialDetailsModal({
  isOpen,
  onClose,
  credential,
}: CredentialDetailsModalProps) {
  if (!credential) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
      <ModalHeader>
        <div>
          <ModalTitle>{credential.name}</ModalTitle>
          <ModalDescription>
            Issued by {credential.issuer} • Status: {credential.status}
          </ModalDescription>
        </div>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <p className="text-sm text-gray-900">{credential.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Issue Date</label>
              <p className="text-sm text-gray-900">
                {new Date(credential.issuedAt).toLocaleDateString()}
              </p>
            </div>
            {credential.expirationDate && (
              <div>
                <label className="text-sm font-medium text-gray-700">Expiration Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(credential.expirationDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Holder</label>
              <p className="text-sm text-gray-900">{credential.holder}</p>
            </div>
          </div>

          {credential.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-sm text-gray-900 mt-1">{credential.description}</p>
            </div>
          )}

          {credential.metadata && (
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Information</label>
              <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(credential.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Share Credential
        </button>
      </ModalFooter>
    </Modal>
  );
}

// Settings Modal
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  data?: any;
}

export function SettingsModal({
  isOpen,
  onClose,
  type,
  data,
}: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <ModalHeader>
        <ModalTitle>Advanced Settings</ModalTitle>
      </ModalHeader>

      <ModalContent>
        <div className="text-center py-8">
          <p className="text-gray-600">
            Advanced settings for <strong>{type}</strong> are coming soon.
          </p>
          {data && (
            <pre className="text-xs text-gray-500 mt-4 bg-gray-50 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Got it
        </button>
      </ModalFooter>
    </Modal>
  );
}
