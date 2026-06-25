
import React, { useState, useEffect } from "react";
import PublicInvitation from "./components/PublicInvitation";
import FeedbackPage from "./components/FeedbackPage";
import TemplatePreviewPage from "./components/TemplatePreviewPage";
import SimpleTemplatePreviewPage from "./components/SimpleTemplatePreviewPage";
import DashboardApp from "./components/DashboardApp";
import PaymentAccessGate from "./components/PaymentAccessGate";
import AdminApp from "./admin/AdminApp";
import AuthForm from "./components/AuthForm";
import LandingPage from "./LandingPage"; // Import the new LandingPage
import { ToastProvider } from "./components/ui/use-toast";
import { Toaster } from "./components/ui/toaster";
import { GOOGLE_FONTS_URL } from "./config/fonts";
import { normalizeMediaFieldsDeep } from "./config/api";
import { API_URL } from "./constants";
import { isPaymentRequired } from "./lib/paymentAccess";
import { UserSession } from "./types";

const RedirectTo = ({ path }: { path: string }) => {
    useEffect(() => {
        window.location.replace(path);
    }, [path]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050706] text-sm font-medium text-white/70">
            Se verifica accesul...
        </div>
    );
};

const AccountAccessBoundary = ({ adminOnly = false }: { adminOnly?: boolean }) => {
    const [verifiedSession, setVerifiedSession] = useState<UserSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const verifyAccess = async () => {
            try {
                const rawSession = localStorage.getItem("weddingPro_session");
                const localSession = rawSession
                    ? normalizeMediaFieldsDeep(JSON.parse(rawSession)) as UserSession
                    : null;

                if (!localSession?.token) {
                    window.location.replace("/login");
                    return;
                }

                const response = await fetch(`${API_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${localSession.token}`,
                    },
                    cache: "no-store",
                });

                if (!response.ok) {
                    localStorage.removeItem("weddingPro_session");
                    localStorage.removeItem("weddingPro_view");
                    window.location.replace("/login");
                    return;
                }

                const freshSession = normalizeMediaFieldsDeep(await response.json()) as UserSession;
                const nextSession = {
                    ...localSession,
                    ...freshSession,
                    token: localSession.token,
                    requiresPayment: isPaymentRequired(freshSession),
                };

                localStorage.setItem("weddingPro_session", JSON.stringify(nextSession));
                if (!cancelled) {
                    setVerifiedSession(nextSession);
                    setIsLoading(false);
                }
            } catch {
                if (!cancelled) setIsLoading(false);
            }
        };

        void verifyAccess();
        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050706] text-sm font-medium text-white/70">
                Se verifica accesul contului...
            </div>
        );
    }

    if (!verifiedSession) {
        return <RedirectTo path="/login" />;
    }

    if (adminOnly) {
        return verifiedSession.isAdmin === true
            ? <AdminApp />
            : <RedirectTo path="/dashboard" />;
    }

    return isPaymentRequired(verifiedSession)
        ? <PaymentAccessGate />
        : <DashboardApp />;
};

const App = () => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);

        // Apply theme
        const savedTheme = localStorage.getItem('weddingPro_theme');
        const isDark = savedTheme ? savedTheme === 'dark' : false;
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const completeLogin = async (incomingSession: UserSession) => {
        let nextSession = normalizeMediaFieldsDeep(incomingSession);

        if (nextSession.token) {
            try {
                const response = await fetch(`${API_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${nextSession.token}`,
                    },
                });
                if (response.ok) {
                    const freshSession = normalizeMediaFieldsDeep(await response.json());
                    nextSession = {
                        ...nextSession,
                        ...freshSession,
                        token: nextSession.token,
                    };
                }
            } catch {
                // Raspunsul de login ramane fallback daca refresh-ul este intrerupt.
            }
        }

        nextSession = {
            ...nextSession,
            requiresPayment: isPaymentRequired(nextSession),
        };
        localStorage.removeItem("weddingPro_view");
        localStorage.setItem("weddingPro_session", JSON.stringify(nextSession));
        window.location.replace("/dashboard");
    };

    // Determine view based on path
    const renderView = () => {
        const decodedPath = (() => {
            try {
                return decodeURIComponent(currentPath);
            } catch {
                return currentPath;
            }
        })();
        const storedSessionRaw = localStorage.getItem('weddingPro_session');
        let hasActiveSession = false;
        let storedSession: UserSession | null = null;
        if (storedSessionRaw) {
            try {
                storedSession = normalizeMediaFieldsDeep(JSON.parse(storedSessionRaw));
                hasActiveSession = !!storedSession?.token && !!storedSession?.userId;
            } catch {
                hasActiveSession = false;
                storedSession = null;
            }
        }

        if ((currentPath === '/login' || currentPath === '/register') && hasActiveSession) {
            return <RedirectTo path="/dashboard" />;
        }

        if (currentPath.startsWith('/admin')) {
            return hasActiveSession
                ? <AccountAccessBoundary adminOnly />
                : <AdminApp />;
        }
        
        if (currentPath.includes('/invite/') || currentPath.includes('/public')) {
            return <PublicInvitation />;
        }

        if (currentPath === '/feedback' || decodedPath.includes('{{feedbackUrl')) {
            return <FeedbackPage />;
        }

        if (currentPath.startsWith('/templates/') && currentPath.endsWith('/preview')) {
            return <TemplatePreviewPage />;
        }

        if (currentPath.startsWith('/simple-template-preview')) {
            return <SimpleTemplatePreviewPage />;
        }

        if (currentPath === '/home' || currentPath === '/') {
            return <LandingPage />;
        }

        if (currentPath === '/dashboard') {
            if (!hasActiveSession) {
                return <RedirectTo path="/login" />;
            }
            return <AccountAccessBoundary />;
        }

        if (currentPath === '/login') {
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    <AuthForm 
                        onLogin={completeLogin}
                        initialView="login"
                    />
                </div>
            );
        }

        if (currentPath === '/register') {
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                    <AuthForm 
                        onLogin={completeLogin}
                        initialView="register"
                    />
                </div>
            );
        }

        // Default: Dashboard (Protected inside DashboardApp logic)
        return hasActiveSession
            ? <AccountAccessBoundary />
            : <RedirectTo path="/login" />;
    };

    return (
        <ToastProvider>
            <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
            {renderView()}
            <Toaster />
        </ToastProvider>
    );
};

export default App;
