import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../constants";
import { IconCheck, IconStar } from "./Icons";
import SpotlightCard from "./SpotlightCard";

type PlanId = "free" | "basic" | "premium";

type PlanConfig = {
  id: PlanId;
  displayName: string;
  description: string;
  price: string;
  originalPrice?: string;
  period: string;
  features: string[];
  featured?: boolean;
  spotlightColor: string;
};

type PricingConfig = {
  basicPrice: number;
  premiumPrice: number;
  oldPrice?: number;
  currency?: string;
};

const DEFAULT_PRICING: PricingConfig = {
  basicPrice: 1900,
  premiumPrice: 4900,
  oldPrice: 10000,
  currency: "ron",
};

const FREE_FEATURES = [
  "1 invitat demo",
  "5 elemente in planificatorul de mese",
  "3 sarcini personalizate",
  "6 randuri / categorie in buget",
  "Calculator buget pana la 500 LEI",
];

const BASIC_FEATURES = [
  "Invitatii digitale + RSVP",
  "Gestionare invitati si confirmari",
  "Configurare template si setari eveniment",
  "Marketplace servicii + cereri furnizori",
  "Facturare si istoric plati",
];

const PRO_FEATURES = [
  "Tot ce include Basic",
  "Planificator mese complet (drag & drop)",
  "Calendar si Sarcini fara limitari",
  "Buget complet + distributie automata",
  "Exporturi PDF si flux complet de organizare",
];

const toCents = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  // Unele raspunsuri pot veni direct in LEI (ex: 49) si le normalizam la bani.
  if (parsed < 200) return Math.round(parsed * 100);
  return Math.round(parsed);
};

const formatLei = (cents: number) => `${Math.round(cents / 100)} LEI`;

export default function Pricing() {
  const [session, setSession] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);

  useEffect(() => {
    const saved = localStorage.getItem("weddingPro_session");
    if (!saved) return;
    try {
      setSession(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPricing = async () => {
      const headers: Record<string, string> = {};
      if (session?.token) headers.Authorization = `Bearer ${session.token}`;

      const endpoints = [
        `${API_URL}/config/pricing`,
        `${API_URL}/config/public`,
        `${API_URL}/config`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { headers });
          if (!res.ok) continue;

          const data = await res.json();
          const source = data?.pricing ?? data;

          const basicPrice = toCents(source?.basicPrice, DEFAULT_PRICING.basicPrice);
          const premiumPrice = toCents(source?.premiumPrice, DEFAULT_PRICING.premiumPrice);

          const oldRaw = Number(source?.oldPrice);
          const oldPrice = Number.isFinite(oldRaw)
            ? toCents(oldRaw, DEFAULT_PRICING.oldPrice || 10000)
            : undefined;

          if (!cancelled) {
            setPricing({
              basicPrice,
              premiumPrice,
              oldPrice,
              currency: String(source?.currency || "ron").toLowerCase(),
            });
          }
          return;
        } catch {
          // Try next endpoint.
        }
      }
    };

    fetchPricing();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const dashboardHref = session ? (session.isAdmin ? "/admin" : "/dashboard") : "/register";

  const currentPlan: PlanId = useMemo(() => {
    const plan = session?.plan;
    if (plan === "basic" || plan === "premium") return plan;
    return "free";
  }, [session?.plan]);

  const plans: PlanConfig[] = useMemo(() => {
    const basicPriceLabel = formatLei(pricing.basicPrice);
    const premiumPriceLabel = formatLei(pricing.premiumPrice);
    const oldPriceLabel =
      pricing.oldPrice && pricing.oldPrice > pricing.premiumPrice
        ? formatLei(pricing.oldPrice)
        : undefined;

    return [
      {
        id: "free",
        displayName: "Free",
        description: "Plan de test pentru a vedea platforma in actiune.",
        price: "Gratuit",
        period: "Fara cost",
        features: FREE_FEATURES,
        spotlightColor: "rgba(255, 255, 255, 0.1)",
      },
      {
        id: "basic",
        displayName: "Basic",
        description: "Ideal pentru invitatii, RSVP si management invitati.",
        price: basicPriceLabel,
        period: "Plata unica",
        features: BASIC_FEATURES,
        spotlightColor: "rgba(99, 102, 241, 0.16)",
      },
      {
        id: "premium",
        displayName: "Pro",
        description: "Acces complet la toate modulele de planificare.",
        price: premiumPriceLabel,
        originalPrice: oldPriceLabel,
        period: "Plata unica",
        features: PRO_FEATURES,
        featured: true,
        spotlightColor: "rgba(232, 121, 249, 0.2)",
      },
    ];
  }, [pricing]);

  const ctaLabel = (planId: PlanId) => {
    if (!session) {
      if (planId === "free") return "Incepe Gratuit";
      if (planId === "basic") return "Alege Basic";
      return "Activeaza Pro";
    }

    if (currentPlan === planId) return "Plan activ";
    if (planId === "free") return "Mergi la Dashboard";
    return "Upgrade din Dashboard";
  };

  return (
    <section id="pricing" className="wp-pricing-section">
      <div className="wp-container">
        <div className="wp-section-header wp-fade-up">
          <span className="wp-section-tag">Preturi</span>
          <h2 className="wp-section-title">
            Alege planul potrivit
            <br />
            pentru evenimentul tau.
          </h2>
          <p className="wp-section-desc">
            Free pentru testare, Basic pentru invitatii si RSVP, Pro pentru organizare completa.
          </p>
        </div>

        <div className="wp-pricing-grid">
          {plans.map((plan, idx) => {
            const isActivePlan = !!session && currentPlan === plan.id;
            const animationClass = idx === 0 ? "wp-d1" : idx === 1 ? "wp-d2" : "wp-d3";
            const buttonClass = plan.featured ? "wp-btn-plan main" : "wp-btn-plan secondary";

            return (
              <SpotlightCard
                key={plan.id}
                className={`wp-price-card ${plan.featured ? "featured" : ""} wp-fade-up ${animationClass}`}
                spotlightColor={plan.spotlightColor}
              >
                {(plan.featured || isActivePlan) && (
                  <span className="wp-price-badge">{isActivePlan ? "Plan activ" : "Popular"}</span>
                )}

                <div className="wp-price-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {plan.displayName}
                  {plan.id === "premium" && <IconStar />}
                </div>

                <div className="wp-price-desc">{plan.description}</div>

                {plan.originalPrice ? (
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <div className="wp-price-amount paid">{plan.price}</div>
                    <span className="wp-price-orig">{plan.originalPrice}</span>
                  </div>
                ) : (
                  <div className={`wp-price-amount ${plan.id === "free" ? "" : "paid"}`}>{plan.price}</div>
                )}

                <div className="wp-price-period">{plan.period}</div>
                <div className="wp-price-divider" />

                <ul className="wp-price-list">
                  {plan.features.map((feature) => (
                    <li key={`${plan.id}-${feature}`} className="active">
                      <span className={`wp-price-check ${plan.featured ? "main" : "muted"}`}>
                        <IconCheck color={plan.featured ? "var(--primary)" : "currentColor"} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a href={dashboardHref} className={buttonClass}>
                  {ctaLabel(plan.id)}
                </a>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
