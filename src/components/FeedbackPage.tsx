import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../constants";

const OPTIONS = [
  { id: "nu-am-inteles", label: "Nu am inteles exact ce primesc" },
  { id: "pret-prea-mare", label: "Pretul este prea mare" },
  { id: "nu-am-nevoie-acum", label: "Nu am nevoie acum" },
  { id: "alta-solutie", label: "Am ales alta solutie" },
  { id: "nu-am-avut-incredere", label: "Nu am avut suficienta incredere" },
  { id: "demo-mai-clar", label: "Mi-ar fi placut un demo mai clar" },
  { id: "alt-motiv", label: "Alt motiv" },
];

const FeedbackPage = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const campaignId = params.get("campaign") || "";
  const recipientId = params.get("recipient") || "";
  const initialChoice = params.get("choice") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState<any>(null);
  const [choice, setChoice] = useState(initialChoice);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!campaignId || !recipientId) {
        if (!cancelled) {
          setError("Linkul de feedback este invalid.");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/email-feedback/form?campaign=${encodeURIComponent(campaignId)}&recipient=${encodeURIComponent(recipientId)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Nu am putut incarca formularul.");
        if (cancelled) return;

        setPageData(data);
        setChoice((prev) => prev || data?.recipient?.answerChoice || "");
        setAnswerText(data?.recipient?.answerText || "");
        setSubmitted(Boolean(data?.recipient?.formSubmittedAt));

        await fetch(`${API_URL}/email-feedback/visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId,
            recipientId,
            choice: initialChoice || data?.recipient?.answerChoice || "",
          }),
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Nu am putut incarca formularul.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [campaignId, recipientId, initialChoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/email-feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          recipientId,
          choice,
          answerText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Nu am putut salva raspunsul.");
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Nu am putut salva raspunsul.");
    } finally {
      setSaving(false);
    }
  };

  const title = pageData?.campaign?.title || "Un mesaj rapid";
  const recipientName = pageData?.recipient?.name || "prietene";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff1e7,transparent_42%),linear-gradient(180deg,#fffaf6_0%,#f7efe8_100%)] px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-[#eaded5] bg-white/90 p-8 shadow-[0_24px_80px_rgba(98,63,44,0.12)] backdrop-blur">
          <div className="mb-6 inline-flex rounded-full border border-[#efcdb9] bg-[#fff4ec] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b86b4d]">
            Feedback Esa
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-zinc-500">Se incarca formularul...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : submitted ? (
            <div className="space-y-4 py-8">
              <h1 className="text-3xl font-semibold tracking-tight text-[#2b180f]">
                Multumesc pentru raspuns
              </h1>
              <p className="text-[15px] leading-7 text-[#5a4337]">
                Mesajul tau a fost salvat. Il citesc personal si ma ajuta mult sa inteleg ce te
                blocheaza cel mai tare in organizare.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2b180f]">{title}</h1>
                <p className="text-[15px] leading-7 text-[#5a4337]">
                  Salut, <span className="font-semibold text-[#2b180f]">{recipientName}</span>. Ai
                  creat un cont pe Event Smart Assistant, dar nu ai cumparat un plan. Ne poti
                  ajuta cu un feedback de 10 secunde?
                </p>
                <p className="text-[15px] leading-7 text-[#5a4337]">
                  Care a fost principalul motiv?
                </p>
              </div>

              <div className="grid gap-3">
                {OPTIONS.map((option) => {
                  const active = choice === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setChoice(option.id)}
                      className={[
                        "w-full rounded-2xl border px-4 py-4 text-left text-sm transition-all",
                        active
                          ? "border-[#df8161] bg-[#fff1ea] text-[#7f3d25] shadow-sm"
                          : "border-[#eaded5] bg-[#fffdfb] text-[#4f3b31] hover:border-[#e3b09a]",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#9a7d70]">
                  Daca vrei, spune-mi mai multe
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Scrie liber aici ce te incurca, ce ai incercat pana acum sau ce ti-ai dori sa existe."
                  className="min-h-[170px] w-full rounded-2xl border border-[#eaded5] bg-[#fffdfb] px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#df8161] focus:ring-4 focus:ring-[#f7d9ca]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-2xl bg-[#d96d4e] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(217,109,78,0.35)] transition hover:bg-[#c95f42] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Se trimite..." : "Trimite raspunsul"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
