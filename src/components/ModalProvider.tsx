import { useAppStore } from "@/stores";
import {
  Modal,
  ConfirmationModal,
  CredentialDetailsModal,
  SettingsModal
} from "@/components/ui/modal";
import { QRCodeScanner } from "@/components/QRCodeScanner";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { BulkOperationsModal } from "@/components/BulkOperationsModal";
import { ShareCredentialModal } from "@/components/ShareCredentialModal";
import { logger } from "@/lib/logger";

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
        <BulkOperationsModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.data?.title}
          operations={modal.data?.operations}
          onStartOperation={modal.data?.onStartOperation}
          onPauseOperation={modal.data?.onPauseOperation}
          onCancelOperation={modal.data?.onCancelOperation}
        />
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

    case "share-credential":
      return (
        <Modal isOpen={modal.isOpen} onClose={closeModal} className="w-full max-w-lg">
          <ShareCredentialModal
            credential={modal.data?.credential}
            onShare={(shareOptions) => {
              // Handle sharing logic here
              logger.info('Sharing credential with options', { shareOptions });
              closeModal();
            }}
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
