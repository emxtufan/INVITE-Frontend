import React, { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import UpgradeModal from "./UpgradeModal";
import { API_URL } from "../constants";
import { normalizeMediaFieldsDeep } from "../config/api";
import { UserSession } from "../types";
import { isPaymentRequired } from "../lib/paymentAccess";

const readStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem("weddingPro_session");
    return raw ? normalizeMediaFieldsDeep(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const PaymentAccessGate = () => {
  const [session, setSession] = useState<UserSession | null>(readStoredSession);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(
    () => new URLSearchParams(window.location.search).get("payment") === "success",
  );

  const unlockAccount = useCallback((freshSession: UserSession) => {
    const currentSession = readStoredSession();
    const nextSession = normalizeMediaFieldsDeep({
      ...currentSession,
      ...freshSession,
      token: freshSession.token || currentSession?.token,
      requiresPayment: false,
    } as UserSession);

    localStorage.setItem("weddingPro_session", JSON.stringify(nextSession));
    window.location.replace("/dashboard");
  }, []);

  const refreshAccount = useCallback(async () => {
    const currentSession = readStoredSession();
    if (!currentSession?.token) {
      window.location.replace("/login");
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${currentSession.token}` },
      });

      if (response.status === 401 || response.status === 403 || response.status === 404) {
        localStorage.removeItem("weddingPro_session");
        window.location.replace("/login");
        return false;
      }

      if (!response.ok) return false;

      const freshSession = normalizeMediaFieldsDeep(await response.json()) as UserSession;
      const updatedSession = {
        ...currentSession,
        ...freshSession,
        token: currentSession.token,
      };
      setSession(updatedSession);
      localStorage.setItem("weddingPro_session", JSON.stringify(updatedSession));

      if (!isPaymentRequired(freshSession)) {
        unlockAccount(updatedSession);
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }, [unlockAccount]);

  useEffect(() => {
    if (!session?.token) {
      window.location.replace("/login");
      return;
    }

    const paymentStatus = new URLSearchParams(window.location.search).get("payment");
    if (paymentStatus !== "success" && paymentStatus !== "pending") {
      void refreshAccount();
      return;
    }

    setIsConfirmingPayment(true);
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      const unlocked = await refreshAccount();
      if (!unlocked && attempts >= 15) {
        setIsConfirmingPayment(false);
      }
    };

    void poll();
    const intervalId = window.setInterval(() => {
      if (attempts >= 15) {
        window.clearInterval(intervalId);
        return;
      }
      void poll();
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [refreshAccount, session?.token]);

  const logout = () => {
    localStorage.removeItem("weddingPro_session");
    localStorage.removeItem("weddingPro_view");
    window.location.replace("/login");
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050706] text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050706] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,118,51,0.2),transparent_30%),radial-gradient(circle_at_85%_72%,rgba(79,128,168,0.22),transparent_34%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-xl backdrop-blur">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ff7633]">
          Activeaza contul
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
          Alege planul potrivit evenimentului tau
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
          Dupa confirmarea platii, contul se deschide automat si poti incepe configurarea invitatiei.
        </p>
      </div>

      {isConfirmingPayment && (
        <div className="fixed inset-x-0 top-0 z-[1200] flex items-center justify-center gap-2 bg-[#101717] px-4 py-3 text-sm font-medium text-white">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirmam plata si activam contul...
        </div>
      )}

      <UpgradeModal
        isOpen
        mandatory
        onClose={() => undefined}
        onLogout={logout}
        userId={session.userId}
        currentPlan="free"
        userEmail={session.profile?.email || session.user}
        userProfile={session.profile}
        onUpgradeSuccess={() => void refreshAccount()}
        basicPrice={session.basicPrice || session.pricing?.basicPrice}
        premiumPrice={session.premiumPrice || session.pricing?.premiumPrice}
        oldPrice={session.pricing?.oldPrice}
      />
    </main>
  );
};

export default PaymentAccessGate;
