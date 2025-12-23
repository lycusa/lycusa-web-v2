"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import KycRequiredModal from "../shared/KycRequiredModal";

interface KycContextType {
  showKycModal: (attemptedAction?: string) => void;
  hideKycModal: () => void;
  isKycModalOpen: boolean;
}

const KycContext = createContext<KycContextType | null>(null);

export function useKyc() {
  const context = useContext(KycContext);
  if (!context) {
    throw new Error("useKyc must be used within a KycProvider");
  }
  return context;
}

// Custom event for KYC required
const KYC_REQUIRED_EVENT = "kyc-required";

interface KycRequiredEventDetail {
  attemptedAction?: string;
}

// Helper function to dispatch KYC required event (can be called from anywhere)
export function dispatchKycRequired(attemptedAction?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<KycRequiredEventDetail>(KYC_REQUIRED_EVENT, {
        detail: { attemptedAction },
      })
    );
  }
}

// Helper function to check if an error is a KYC required error
export function isKycRequiredError(error: any): boolean {
  return (
    error?.response?.status === 403 &&
    error?.response?.data?.code === "KYC_REQUIRED"
  );
}

interface KycProviderProps {
  children: ReactNode;
}

export default function KycProvider({ children }: KycProviderProps) {
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState<string | undefined>();

  const showKycModal = useCallback((action?: string) => {
    setAttemptedAction(action);
    setIsKycModalOpen(true);
  }, []);

  const hideKycModal = useCallback(() => {
    setIsKycModalOpen(false);
    setAttemptedAction(undefined);
  }, []);

  // Listen for KYC required events from anywhere in the app
  useEffect(() => {
    const handleKycRequired = (event: CustomEvent<KycRequiredEventDetail>) => {
      showKycModal(event.detail?.attemptedAction);
    };

    window.addEventListener(
      KYC_REQUIRED_EVENT,
      handleKycRequired as EventListener
    );
    return () => {
      window.removeEventListener(
        KYC_REQUIRED_EVENT,
        handleKycRequired as EventListener
      );
    };
  }, [showKycModal]);

  return (
    <KycContext.Provider value={{ showKycModal, hideKycModal, isKycModalOpen }}>
      {children}
      <KycRequiredModal
        isOpen={isKycModalOpen}
        onClose={hideKycModal}
        attemptedAction={attemptedAction}
      />
    </KycContext.Provider>
  );
}
