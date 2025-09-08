import { useAppStore } from "@/stores";
import {
  Modal,
  ConfirmationModal,
  CredentialDetailsModal,
  SettingsModal
} from "@/components/ui/modal";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

// Modal Provider Component
export function ModalProvider() {
  const { modal, closeModal } = useAppStore();

  if (!modal.isOpen || !modal.type) return null;

  // Render different modal types based on the modal.type
  switch (modal.type) {
    case "confirmation":
      return (
        <ConfirmationModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={() => {
            if (modal.data?.onConfirm) {
              modal.data.onConfirm();
            }
            closeModal();
          }}
          title={modal.data?.title || "Confirm Action"}
          description={modal.data?.description}
          confirmText={modal.data?.confirmText}
          cancelText={modal.data?.cancelText}
          variant={modal.data?.variant || "info"}
          isLoading={modal.data?.isLoading || false}
        />
      );

    case "credential-details":
      return (
        <CredentialDetailsModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          credential={modal.data?.credential}
        />
      );

    case "settings":
      return (
        <SettingsModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.data?.settingType || "general"}
          data={modal.data}
        />
      );

    case "bulk-operations":
      return (
        <Modal isOpen={modal.isOpen} onClose={closeModal} className="w-full max-w-4xl">
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Bulk Operations
            </h2>
            <p className="text-gray-600 mb-4">
              Bulk operations modal would be rendered here
            </p>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </Modal>
      );

    case "qr-scanner":
      return (
        <Modal isOpen={modal.isOpen} onClose={closeModal} className="w-full max-w-lg">
          <QRCodeScanner />
        </Modal>
      );

    case "qr-generator":
      return (
        <Modal isOpen={modal.isOpen} onClose={closeModal} className="w-full max-w-lg">
          <QRCodeGenerator
            data={modal.data?.data || ""}
            title={modal.data?.title || "QR Code"}
          />
        </Modal>
      );

    default:
      return (
        <Modal isOpen={modal.isOpen} onClose={closeModal} className="w-full max-w-md">
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {modal.type?.replace("-", " ").toUpperCase()}
            </h2>
            <p className="text-gray-600 mb-4">
              This modal type is not yet implemented.
            </p>
            <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4 overflow-x-auto">
              {JSON.stringify(modal.data, null, 2)}
            </pre>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </Modal>
      );
  }
}
