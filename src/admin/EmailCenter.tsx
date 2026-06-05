import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { API_URL } from "../constants";
import {
  BellRing,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  FileText,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { cn } from "../lib/utils";

type EmailType =
  | "welcome"
  | "login_alert"
  | "reminder"
  | "product_update"
  | "custom_html";

type PreviewMode = "rendered" | "html";

type EmailDraft = {
  subject: string;
  preheader: string;
  html: string;
};

type FeedbackCampaignDraft = {
  title: string;
  subject: string;
  preheader: string;
  html: string;
  pauseMs: number;
  limit: number;
  onlyWithoutPayments: boolean;
  onlyVerified: boolean;
  onlyFreePlan: boolean;
};

const DASHBOARD_URL = "https://esaevents.ro/login";
type EmailThemeId =
  | "slate"
  | "indigo"
  | "emerald"
  | "sky"
  | "amber"
  | "violet";

const EMAIL_THEMES: Record<
  EmailThemeId,
  {
    pageBg: string;
    headerBg: string;
    accent: string;
    accentSoft: string;
    accentBorder: string;
    ctaBg: string;
    ctaText: string;
  }
> = {
  slate: {
    pageBg: "#f4f4f5",
    headerBg: "#fafafa",
    accent: "#18181b",
    accentSoft: "#f4f4f5",
    accentBorder: "#d4d4d8",
    ctaBg: "#18181b",
    ctaText: "#ffffff",
  },
  indigo: {
    pageBg: "#f5f7ff",
    headerBg: "#f1f4ff",
    accent: "#4f46e5",
    accentSoft: "#eef2ff",
    accentBorder: "#c7d2fe",
    ctaBg: "#4f46e5",
    ctaText: "#ffffff",
  },
  emerald: {
    pageBg: "#f5fbf7",
    headerBg: "#effaf3",
    accent: "#059669",
    accentSoft: "#ecfdf5",
    accentBorder: "#a7f3d0",
    ctaBg: "#059669",
    ctaText: "#ffffff",
  },
  sky: {
    pageBg: "#f3f9ff",
    headerBg: "#edf6ff",
    accent: "#0284c7",
    accentSoft: "#e0f2fe",
    accentBorder: "#bae6fd",
    ctaBg: "#0284c7",
    ctaText: "#ffffff",
  },
  amber: {
    pageBg: "#fffbf2",
    headerBg: "#fff7e6",
    accent: "#b45309",
    accentSoft: "#fef3c7",
    accentBorder: "#fcd34d",
    ctaBg: "#b45309",
    ctaText: "#ffffff",
  },
  violet: {
    pageBg: "#f7f5ff",
    headerBg: "#f2edff",
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
    accentBorder: "#ddd6fe",
    ctaBg: "#7c3aed",
    ctaText: "#ffffff",
  },
};

const EMAIL_TEMPLATE_META: Record<
  EmailType,
  {
    title: string;
    subtitle: string;
    accent: string;
    badge: string;
  }
> = {
  welcome: {
    title: "Welcome",
    subtitle: "Email de bun venit pentru utilizatori noi.",
    accent: "from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/20",
    badge: "Clasic",
  },
  login_alert: {
    title: "Alerta conectare",
    subtitle: "Anunta utilizatorul despre o conectare noua.",
    accent: "from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20",
    badge: "Securitate",
  },
  reminder: {
    title: "Reminder eveniment",
    subtitle: "Mesaj de reamintire pentru evenimentul apropiat.",
    accent: "from-sky-500/15 via-sky-500/5 to-transparent border-sky-500/20",
    badge: "Automat",
  },
  product_update: {
    title: "Update Esa",
    subtitle: "Template pentru update de panel si invitatii.",
    accent: "from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/20",
    badge: "Nou",
  },
  custom_html: {
    title: "Custom HTML",
    subtitle: "Compui complet subiectul, preheader-ul si HTML-ul.",
    accent: "from-fuchsia-500/15 via-fuchsia-500/5 to-transparent border-fuchsia-500/20",
    badge: "Avansat",
  },
};

const escapeHtml = (value: string): string =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getUserDisplayName = (user: any): string => {
  const fullName = `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim();
  return fullName || user?.profile?.partner1Name || "Salut";
};

const getEventLabel = (user: any): string => {
  const eventName = String(user?.profile?.eventName || "").trim();
  const eventType = String(user?.profile?.eventType || "").trim();
  if (eventName) return eventName;
  if (eventType) return eventType;
  return "evenimentul tau";
};

const renderInfoCard = (rows: Array<{ label: string; value: string }>, theme: EmailThemeId) => {
  const t = EMAIL_THEMES[theme];
  const htmlRows = rows
    .filter((row) => row && row.label && String(row.value || "").trim())
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;font-size:13px;color:#71717a;vertical-align:top">
            ${escapeHtml(row.label)}:
          </td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid #f4f4f5;font-size:13px;color:#18181b;font-weight:600;text-align:right;vertical-align:top;padding-left:14px">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="border:1px solid ${t.accentBorder};border-radius:12px;background:${t.accentSoft};padding:8px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
        ${htmlRows}
      </table>
    </div>
  `;
};

const buildShellHtml = ({
  headerLabel,
  title,
  intro,
  bodyHtml,
  ctaLabel,
  theme,
}: {
  headerLabel: string;
  title: string;
  intro: string;
  bodyHtml: string;
  ctaLabel: string;
  theme: EmailThemeId;
}) => {
  const t = EMAIL_THEMES[theme];
  return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${t.pageBg};font-family:Inter,Segoe UI,Arial,sans-serif;color:#18181b">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(intro)}</div>
    <div style="max-width:620px;margin:0 auto;padding:28px 14px">
      <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(24,24,27,.06)">
        <div style="height:4px;background:${t.accent}"></div>
        <div style="padding:20px 24px;border-bottom:1px solid #e4e4e7;background:linear-gradient(180deg,#ffffff 0%,${t.headerBg} 100%)">
          <div style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:999px;border:1px solid ${t.accentBorder};color:${t.accent};background:${t.accentSoft}">${escapeHtml(headerLabel)}</div>
          <h1 style="margin:14px 0 8px;font-size:24px;line-height:1.25;font-weight:700;color:#09090b">${escapeHtml(title)}</h1>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46">${escapeHtml(intro)}</p>
        </div>
        <div style="padding:24px">
          ${bodyHtml}
          <div style="margin-top:18px">
            <a href="${DASHBOARD_URL}" style="display:inline-block;padding:10px 16px;background:${t.ctaBg};color:${t.ctaText};text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 6px 16px rgba(0,0,0,.12)">
              ${escapeHtml(ctaLabel)}
            </a>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid #e4e4e7;background:#fafafa;color:#71717a;font-size:12px;line-height:1.55">
          Email automat trimis de Esa.
        </div>
      </div>
      <p style="margin:12px 2px 0;color:#a1a1aa;font-size:11px;text-align:center">Esa</p>
    </div>
  </body>
</html>`;
};

const buildDraftForType = (type: EmailType, user: any): EmailDraft => {
  const name = escapeHtml(getUserDisplayName(user));
  const eventLabel = escapeHtml(getEventLabel(user));

  switch (type) {
    case "login_alert":
      return {
        subject: "Alerta de conectare la contul tau Esa",
        preheader: "Am observat o conectare noua in contul tau.",
        html: buildShellHtml({
          headerLabel: "Security",
          title: "Alerta de conectare",
          ctaLabel: "Verifica activitatea contului",
          intro: "Monitorizare automata Esa.",
          theme: "amber",
          bodyHtml: `
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46">
              A fost detectata o conectare noua in contul tau.
            </p>
            ${renderInfoCard(
              [
                { label: "Utilizator", value: String(getUserDisplayName(user) || "-") },
                { label: "Email", value: String(user?.user || "-") },
              ],
              "amber",
            )}
            <p style="margin:12px 0 0;font-size:13px;color:#52525b">
              Daca nu recunosti aceasta activitate, intra in platforma si schimba parola cat mai repede.
            </p>`,
        }),
      };
    case "reminder":
      return {
        subject: "Reminder pentru evenimentul tau din Esa",
        preheader: "Evenimentul se apropie. Revizuieste invitatia si lista de invitati.",
        html: buildShellHtml({
          headerLabel: "Reminder",
          title: "Evenimentul se apropie",
          ctaLabel: "Deschide platforma",
          intro: "Revino in dashboard pentru ultimele ajustari.",
          theme: "sky",
          bodyHtml: `
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46">
              Salut, <b style="color:#09090b">${name}</b>!
            </p>
            ${renderInfoCard(
              [
                { label: "Eveniment", value: String(getEventLabel(user) || "-") },
                { label: "Tip", value: String(user?.profile?.eventType || "-") },
                { label: "Data", value: String(user?.profile?.weddingDate || "-") },
              ],
              "sky",
            )}
            <p style="margin:12px 0 0;font-size:13px;color:#52525b">
              Verifica invitatia, lista de invitati si confirmarile primite pana acum, astfel incat totul sa fie pregatit la timp.
            </p>`,
        }),
      };
    case "product_update":
      return {
        subject: "Am facut update la platforma Esa",
        preheader:
          "Invitatiile au fost actualizate, iar configurarea este acum mai simpla si mai intuitiva.",
        html: buildShellHtml({
          headerLabel: "Product Update",
          title: "Platforma Esa a fost actualizata",
          ctaLabel: "Deschide platforma",
          intro:
            "Invitatiile au fost actualizate, iar configurarea este acum mai simpla si mai intuitiva.",
          theme: "emerald",
          bodyHtml: `
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46">
              Salut, <b style="color:#09090b">${name}</b>! Am pregatit un update nou pentru platforma <b style="color:#09090b">Esa</b>.
            </p>
            ${renderInfoCard(
              [
                { label: "Wizard", value: "Mai simplu si mai intuitiv" },
                { label: "Invitatii", value: "Actualizate si imbunatatite" },
                { label: "Preview", value: "Mai clar pentru editare" },
                { label: "Configurare", value: "Mai usoara pentru texte, imagini si culori" },
                { label: "Experienta", value: "Mai buna pe mobil si desktop" },
              ],
              "emerald",
            )}
            <p style="margin:12px 0 0;font-size:13px;color:#52525b">
              Intra in contul tau si vezi noile actualizari disponibile. Daca ai deja o invitatie configurata, poti reveni oricand pentru a descoperi imbunatatirile.
            </p>`,
        }),
      };
    case "custom_html":
      return {
        subject: "Email custom din Esa",
        preheader: "Editeaza liber subiectul, preheader-ul si continutul HTML.",
        html: buildShellHtml({
          headerLabel: "Custom",
          title: "Template custom",
          ctaLabel: "Deschide platforma",
          intro: "Editeaza liber subiectul, preheader-ul si continutul HTML.",
          theme: "slate",
          bodyHtml: `
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46">
              Salut, <b style="color:#09090b">${name}</b>!
            </p>
            <p style="margin:0;font-size:13px;color:#52525b">
              Acesta este un punct de plecare pentru un email HTML complet custom.
            </p>`,
        }),
      };
    case "welcome":
    default:
      return {
        subject: "Bine ai venit in Esa",
        preheader: "Contul tau este gata. Poti incepe configurarea invitatiei.",
        html: buildShellHtml({
          headerLabel: "Welcome",
          title: "Bine ai venit",
          ctaLabel: "Intra in cont",
          intro: "Contul tau este gata. Poti incepe configurarea invitatiei.",
          theme: "violet",
          bodyHtml: `
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46">
              Salut, <b style="color:#09090b">${name}</b>! Configurarea contului tau este pregatita.
            </p>
            ${renderInfoCard(
              [
                { label: "Eveniment", value: eventLabel },
                { label: "Email", value: String(user?.user || "-") },
              ],
              "violet",
            )}
            <p style="margin:12px 0 0;font-size:13px;color:#52525b">
              Alege un template, personalizeaza textele si imaginile, apoi trimite invitatiile catre invitatii tai.
            </p>`,
        }),
      };
  }
};

const DEFAULT_FEEDBACK_CAMPAIGN_HTML = `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ne poti ajuta cu un feedback de 10 secunde?</title>
  </head>
  <body style="margin:0;padding:0;background:#fdf6f0;font-family:Georgia,serif;color:#1a1a1a">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Ai creat un cont pe Event Smart Assistant, dar nu ai cumparat un plan. Care a fost principalul motiv?</div>
    <div style="max-width:600px;margin:0 auto;padding:32px 16px">
      <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#f9e4d4 0%,#fce4ec 50%,#e8d5f5 100%);padding:40px 36px 32px;text-align:center">
          <div style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;padding:4px 14px;border-radius:999px;border:1px solid rgba(224,122,95,0.35);color:#e07a5f;background:rgba(255,255,255,0.6);margin-bottom:16px">
            Un mesaj personal
          </div>
          <h1 style="margin:0;font-size:26px;line-height:1.3;font-weight:400;color:#2d1b0e">
            Ne poti ajuta cu un <em style="color:#e07a5f">feedback de 10 secunde</em>?
          </h1>
        </div>

        <div style="padding:32px 36px">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#3d3028">
            Ai creat un cont pe <strong style="color:#1a1a1a">Event Smart Assistant</strong>, dar nu ai cumparat un plan.
          </p>

          <div style="background:linear-gradient(135deg,#fff5f0 0%,#fef9ff 100%);border:1.5px solid #f4c8b8;border-radius:16px;padding:24px 28px;margin-bottom:28px">
            <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#e07a5f">Intrebarea mea pentru tine</p>
            <p style="margin:0;font-size:18px;line-height:1.55;color:#2d1b0e;font-style:italic">
              Care a fost principalul motiv?
            </p>
          </div>

          <p style="margin:0 0 14px;font-size:13px;color:#9a8a80;text-align:center">Poti alege rapid una dintre variante:</p>

          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-bottom:10px">
            <tr>
              <td style="padding:0 6px 10px 0;width:50%;vertical-align:top">
                <a href="{{feedbackUrl:nu-am-inteles}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Nu am inteles exact ce primesc
                </a>
              </td>
              <td style="padding:0 0 10px 6px;width:50%;vertical-align:top">
                <a href="{{feedbackUrl:pret-prea-mare}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Pretul este prea mare
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 6px 10px 0;vertical-align:top">
                <a href="{{feedbackUrl:nu-am-nevoie-acum}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Nu am nevoie acum
                </a>
              </td>
              <td style="padding:0 0 10px 6px;vertical-align:top">
                <a href="{{feedbackUrl:alta-solutie}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Am ales alta solutie
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 6px 10px 0;vertical-align:top">
                <a href="{{feedbackUrl:nu-am-avut-incredere}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Nu am avut suficienta incredere
                </a>
              </td>
              <td style="padding:0 0 10px 6px;vertical-align:top">
                <a href="{{feedbackUrl:demo-mai-clar}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Mi-ar fi placut un demo mai clar
                </a>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:0 0 10px 0;vertical-align:top">
                <a href="{{feedbackUrl:alt-motiv}}" style="display:block;text-decoration:none;padding:14px 16px;background:#fff;border:1.5px solid #e8ddd8;border-radius:12px;font-size:13px;color:#3d3028;line-height:1.45">
                  Alt motiv: ______
                </a>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin:28px 0 8px">
            <a href="{{feedbackUrl}}" style="display:inline-block;padding:14px 32px;background:#e07a5f;color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 6px 20px rgba(224,122,95,.35)">
              Deschide formularul complet
            </a>
          </div>

          <p style="margin:16px 0 0;font-size:12px;color:#b0a098;text-align:center">
            Sau raspunde direct la acest email. Citesc fiecare mesaj personal.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;

const createFeedbackCampaignDraft = (): FeedbackCampaignDraft => ({
  title: "Feedback clienti fara achizitie",
  subject: "Ne poti ajuta cu un feedback de 10 secunde?",
  preheader: "Ai creat un cont pe Event Smart Assistant, dar nu ai cumparat un plan. Care a fost principalul motiv?",
  html: DEFAULT_FEEDBACK_CAMPAIGN_HTML,
  pauseMs: 2500,
  limit: 140,
  onlyWithoutPayments: true,
  onlyVerified: true,
  onlyFreePlan: false,
});

const EmailCenter = ({ token }: { token: string }) => {
  const { toast } = useToast();

  const [status, setStatus] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [emailType, setEmailType] = useState<EmailType>("product_update");
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({
    subject: "",
    preheader: "",
    html: "",
  });
  const [previewMode, setPreviewMode] = useState<PreviewMode>("rendered");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [daysAhead, setDaysAhead] = useState(3);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [campaignDraft, setCampaignDraft] = useState<FeedbackCampaignDraft>(() =>
    createFeedbackCampaignDraft(),
  );
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<any>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignUserSearch, setCampaignUserSearch] = useState("");
  const [selectedCampaignUserIds, setSelectedCampaignUserIds] = useState<string[]>([]);

  useEffect(() => {
    void loadStatus();
    void loadUsers();
    void loadCampaigns();
  }, [token]);

  const loadStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/email/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Status unavailable");
      setStatus(data);
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut citi statusul emailurilor.",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Users unavailable");
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      if (list.length && !selectedUserId) setSelectedUserId(list[0]._id);
      setSelectedCampaignUserIds((prev) => (prev.length ? prev : list.map((user) => user._id)));
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut incarca utilizatorii.",
        variant: "destructive",
      });
    }
  };

  const loadCampaigns = async (campaignIdToOpen?: string) => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch(`${API_URL}/admin/email/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Campaigns unavailable");
      const list = Array.isArray(data?.campaigns) ? data.campaigns : [];
      setCampaigns(list);

      const nextId =
        campaignIdToOpen ||
        selectedCampaignId ||
        list[0]?._id ||
        "";
      if (nextId) {
        setSelectedCampaignId(nextId);
        await loadCampaignDetail(nextId);
      } else {
        setSelectedCampaignDetail(null);
      }
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut incarca istoria campaniilor.",
        variant: "destructive",
      });
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadCampaignDetail = async (campaignId: string) => {
    if (!campaignId) {
      setSelectedCampaignDetail(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/email/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Campaign detail unavailable");
      setSelectedCampaignDetail(data);
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut incarca detaliile campaniei.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower) return users;
    return users.filter((u) => {
      const fullName = `${u?.profile?.firstName || ""} ${u?.profile?.lastName || ""}`.toLowerCase();
      return String(u?.user || "").toLowerCase().includes(lower) || fullName.includes(lower);
    });
  }, [users, search]);

  const selectedUser = useMemo(
    () => users.find((u) => u._id === selectedUserId) || null,
    [users, selectedUserId],
  );

  const campaignEligibleUsers = useMemo(() => {
    let list = [...users];
    if (campaignDraft.onlyVerified) {
      list = list.filter((user) => user?.emailVerified !== false);
    }
    if (campaignDraft.onlyWithoutPayments) {
      list = list.filter((user) => !Array.isArray(user?.payments) || user.payments.length === 0);
    }
    if (campaignDraft.onlyFreePlan) {
      list = list.filter((user) => String(user?.plan || "").toLowerCase() === "free");
    }
    return list;
  }, [
    users,
    campaignDraft.onlyVerified,
    campaignDraft.onlyWithoutPayments,
    campaignDraft.onlyFreePlan,
  ]);

  const filteredCampaignUsers = useMemo(() => {
    const lower = campaignUserSearch.trim().toLowerCase();
    if (!lower) return users;
    return users.filter((user) => {
      const fullName = `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`
        .trim()
        .toLowerCase();
      const eventName = String(user?.profile?.eventName || "").toLowerCase();
      return (
        String(user?.user || "").toLowerCase().includes(lower) ||
        fullName.includes(lower) ||
        eventName.includes(lower)
      );
    });
  }, [users, campaignUserSearch]);

  useEffect(() => {
    const statusValue = selectedCampaignDetail?.campaign?.status;
    if (statusValue !== "queued" && statusValue !== "sending") return;

    const timer = window.setInterval(() => {
      if (selectedCampaignId) {
        void loadCampaignDetail(selectedCampaignId);
        void loadCampaigns(selectedCampaignId);
      }
    }, 8000);

    return () => window.clearInterval(timer);
  }, [selectedCampaignDetail?.campaign?.status, selectedCampaignId]);

  useEffect(() => {
    setEmailDraft(buildDraftForType(emailType, selectedUser));
  }, [emailType, selectedUser]);

  const activeTemplateMeta = EMAIL_TEMPLATE_META[emailType];

  const sendTestEmail = async () => {
    if (!selectedUserId) {
      toast({ title: "Alege un utilizator", variant: "destructive" });
      return;
    }

    if (!emailDraft.subject.trim() || !emailDraft.html.trim()) {
      toast({
        title: "Continut incomplet",
        description: "Completeaza subiectul si continutul HTML inainte de trimitere.",
        variant: "destructive",
      });
      return;
    }

    setSendingTest(true);
    try {
      const res = await fetch(`${API_URL}/admin/email/send-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          type: emailType,
          templateKey: emailType,
          subject: emailDraft.subject,
          preheader: emailDraft.preheader,
          html: emailDraft.html,
          customSubject: emailDraft.subject,
          customPreviewText: emailDraft.preheader,
          customHtml: emailDraft.html,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Send failed");
      toast({
        title: "Email trimis",
        description:
          emailType === "custom_html"
            ? "Emailul custom a fost trimis cu HTML-ul editat."
            : "Emailul test a fost trimis cu succes.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Eroare trimitere",
        description: err?.message || "Nu am putut trimite emailul.",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const sendBulkReminders = async () => {
    setSendingBulk(true);
    setBulkResult(null);
    try {
      const res = await fetch(`${API_URL}/admin/email/send-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          daysAhead,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Bulk send failed");
      setBulkResult(data);
      toast({ title: "Reminder-ele au fost procesate", variant: "success" });
    } catch (err: any) {
      toast({
        title: "Eroare reminder",
        description: err?.message || "Nu am putut trimite reminder-ele.",
        variant: "destructive",
      });
    } finally {
      setSendingBulk(false);
    }
  };

  const sendFeedbackCampaign = async () => {
    if (!campaignDraft.subject.trim() || !campaignDraft.html.trim()) {
      toast({
        title: "Campanie incompleta",
        description: "Completeaza subiectul si HTML-ul campaniei inainte de trimitere.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCampaignUserIds.length) {
      toast({
        title: "Niciun utilizator selectat",
        description: "Selecteaza cel putin un utilizator pentru campanie.",
        variant: "destructive",
      });
      return;
    }

    setSendingCampaign(true);
    try {
      const res = await fetch(`${API_URL}/admin/email/campaigns/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...campaignDraft,
          selectedUserIds: selectedCampaignUserIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Campaign send failed");

      toast({
        title: "Campanie pornita",
        description: `Au fost puse in coada ${data?.queued || 0} emailuri.`,
        variant: "success",
      });

      await loadCampaigns(data?.campaignId || "");
    } catch (err: any) {
      toast({
        title: "Eroare campanie",
        description: err?.message || "Nu am putut porni campania.",
        variant: "destructive",
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  const resetTemplate = () => {
    setEmailDraft(buildDraftForType(emailType, selectedUser));
    toast({
      title: "Template resetat",
      description: "Editorul a revenit la varianta implicita pentru acest tip de email.",
      variant: "success",
    });
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailDraft.html);
      toast({ title: "HTML copiat", variant: "success" });
    } catch {
      toast({
        title: "Nu am putut copia",
        description: "Browserul a blocat accesul la clipboard.",
        variant: "destructive",
      });
    }
  };

  const toggleCampaignUser = (userId: string) => {
    setSelectedCampaignUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const selectAllCampaignUsers = () => {
    setSelectedCampaignUserIds(users.map((user) => user._id));
  };

  const deselectAllCampaignUsers = () => {
    setSelectedCampaignUserIds([]);
  };

  const selectEligibleCampaignUsers = () => {
    setSelectedCampaignUserIds(campaignEligibleUsers.slice(0, campaignDraft.limit).map((user) => user._id));
  };

  const invertCampaignSelection = () => {
    setSelectedCampaignUserIds((prev) =>
      users.map((user) => user._id).filter((userId) => !prev.includes(userId)),
    );
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-zinc-200/80 bg-gradient-to-br from-white via-white to-zinc-50/80">
        <CardHeader className="border-b border-zinc-200/70 bg-gradient-to-r from-zinc-950 to-zinc-900 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="w-5 h-5 text-amber-300" />
            Email Center
          </CardTitle>
          <CardDescription className="text-zinc-300">
            Gestioneaza campanii test, template-uri HTML si preview live pentru emailurile trimise din Esa.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Provider
              </div>
              <div className="mt-3 text-lg font-semibold text-zinc-900">
                {status?.provider || "resend"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Status
              </div>
              <div
                className={cn(
                  "mt-3 text-lg font-semibold",
                  status?.enabled ? "text-emerald-600" : "text-red-600",
                )}
              >
                {status?.enabled ? "Activ" : "Inactiv"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                <Users className="w-4 h-4 text-sky-500" />
                Utilizatori
              </div>
              <div className="mt-3 text-lg font-semibold text-zinc-900">{users.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <Card className="border-zinc-200/80">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-fuchsia-500" />
              Template-uri email
            </CardTitle>
            <CardDescription>
              Alege un template, personalizeaza-l si trimite un email test catre un utilizator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Cauta utilizator dupa email sau nume..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />

            <select
              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {filteredUsers.map((u) => {
                const fullName = `${u?.profile?.firstName || ""} ${u?.profile?.lastName || ""}`.trim();
                return (
                  <option key={u._id} value={u._id}>
                    {u.user} {fullName ? `- ${fullName}` : ""}
                  </option>
                );
              })}
            </select>

            <div className="space-y-3">
              {(Object.keys(EMAIL_TEMPLATE_META) as EmailType[]).map((type) => {
                const meta = EMAIL_TEMPLATE_META[type];
                const isActive = emailType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEmailType(type)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all",
                      "bg-gradient-to-br",
                      meta.accent,
                      isActive
                        ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                        : "border-zinc-200 hover:border-zinc-300",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          {meta.title}
                        </div>
                        <div className="mt-1 text-xs leading-relaxed text-zinc-600">
                          {meta.subtitle}
                        </div>
                      </div>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className="shrink-0"
                      >
                        {meta.badge}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedUser && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                <div className="font-semibold text-zinc-900">{getUserDisplayName(selectedUser)}</div>
                <div className="mt-1 text-zinc-600">{selectedUser.user}</div>
                <div className="mt-2 text-xs text-zinc-500">
                  Eveniment: {selectedUser?.profile?.eventName || "-"} (
                  {selectedUser?.profile?.eventType || "wedding"})
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={resetTemplate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={sendTestEmail} disabled={sendingTest || !selectedUserId}>
                <Send className="w-4 h-4 mr-2" />
                {sendingTest ? "Se trimite..." : "Trimite email test"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Editor email
              </CardTitle>
              <CardDescription>
                Subiectul, preheader-ul si HTML-ul sunt trimise direct in payload catre endpointul de test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Subiect
                  </label>
                  <Input
                    value={emailDraft.subject}
                    onChange={(e: any) =>
                      setEmailDraft((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="Subiect email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Preview text / preheader
                  </label>
                  <Input
                    value={emailDraft.preheader}
                    onChange={(e: any) =>
                      setEmailDraft((prev) => ({ ...prev, preheader: e.target.value }))
                    }
                    placeholder="Text scurt afisat in inbox"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    HTML email
                  </label>
                  <Button variant="outline" size="sm" onClick={copyHtml}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copiaza HTML
                  </Button>
                </div>
                <textarea
                  value={emailDraft.html}
                  onChange={(e) =>
                    setEmailDraft((prev) => ({ ...prev, html: e.target.value }))
                  }
                  className="min-h-[320px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="<html>...</html>"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-emerald-500" />
                    Preview live
                  </CardTitle>
                  <CardDescription>
                    Verifica rapid cum arata emailul randat sau codul HTML brut.
                  </CardDescription>
                </div>
                <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("rendered")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      previewMode === "rendered"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500",
                    )}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1.5" />
                    Rendered
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("html")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      previewMode === "html"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500",
                    )}
                  >
                    <Code2 className="w-3.5 h-3.5 inline mr-1.5" />
                    HTML
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                {previewMode === "rendered" ? (
                  <iframe
                    title="Preview email"
                    srcDoc={emailDraft.html}
                    className="h-[620px] w-full bg-white"
                  />
                ) : (
                  <pre className="max-h-[620px] overflow-auto p-4 text-xs leading-relaxed text-zinc-800 whitespace-pre-wrap break-words">
                    {emailDraft.html}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-500" />
            Reminder automat (manual trigger)
          </CardTitle>
          <CardDescription>
            Trimite reminder-e in bulk pentru evenimentele apropiate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Zile in avans
              </label>
              <Input
                type="number"
                min={0}
                max={30}
                value={daysAhead}
                onChange={(e: any) => setDaysAhead(Number(e.target.value || 0))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={sendBulkReminders} disabled={sendingBulk}>
                {sendingBulk ? "Se proceseaza..." : "Trimite reminder-e"}
              </Button>
            </div>
          </div>

          {bulkResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Scanate", bulkResult.scanned],
                ["Trimise", bulkResult.sent],
                ["Eroare", bulkResult.failed],
                ["Ignorate", bulkResult.skipped],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-zinc-200 bg-white p-4 text-sm"
                >
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    {label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-zinc-900">
                    {value as any}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-200/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-500" />
            Campanie feedback clienti
          </CardTitle>
          <CardDescription>
            Trimite acelasi email in bulk, cu pauza intre mesaje, si urmareste vizitele,
            raspunsurile din formular si reply-urile venite direct pe email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Titlu intern campanie
              </label>
              <Input
                value={campaignDraft.title}
                onChange={(e: any) =>
                  setCampaignDraft((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Subiect email
              </label>
              <Input
                value={campaignDraft.subject}
                onChange={(e: any) =>
                  setCampaignDraft((prev) => ({ ...prev, subject: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preheader
            </label>
            <Input
              value={campaignDraft.preheader}
              onChange={(e: any) =>
                setCampaignDraft((prev) => ({ ...prev, preheader: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Delay ms
              </label>
              <Input
                type="number"
                min={0}
                max={60000}
                value={campaignDraft.pauseMs}
                onChange={(e: any) =>
                  setCampaignDraft((prev) => ({
                    ...prev,
                    pauseMs: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Limita
              </label>
              <Input
                type="number"
                min={1}
                max={500}
                value={campaignDraft.limit}
                onChange={(e: any) =>
                  setCampaignDraft((prev) => ({
                    ...prev,
                    limit: Number(e.target.value || 1),
                  }))
                }
              />
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={campaignDraft.onlyWithoutPayments}
                onChange={(e) =>
                  setCampaignDraft((prev) => ({
                    ...prev,
                    onlyWithoutPayments: e.target.checked,
                  }))
                }
              />
              Fara achizitii
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={campaignDraft.onlyVerified}
                onChange={(e) =>
                  setCampaignDraft((prev) => ({
                    ...prev,
                    onlyVerified: e.target.checked,
                  }))
                }
              />
              Doar email verificat
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={campaignDraft.onlyFreePlan}
                onChange={(e) =>
                  setCampaignDraft((prev) => ({
                    ...prev,
                    onlyFreePlan: e.target.checked,
                  }))
                }
              />
              Doar plan free
            </label>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            <div>Formular feedback: {status?.feedbackFormUrl || "-"}</div>
            <div>Webhook Resend: {status?.resendWebhookConfigured ? "configurat" : "neconfigurat"}</div>
            <div>Reply inbox: {status?.feedbackReplyConfigured ? status?.feedbackReplyDomain : "neconfigurat"}</div>
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Destinatari campanie</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Selectati: {selectedCampaignUserIds.length} din {users.length} utilizatori
                </div>
              </div>
              <Input
                placeholder="Cauta in lista..."
                value={campaignUserSearch}
                onChange={(e: any) => setCampaignUserSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAllCampaignUsers}>
                Selecteaza toti
              </Button>
              <Button variant="outline" size="sm" onClick={selectEligibleCampaignUsers}>
                Selecteaza eligibili
              </Button>
              <Button variant="outline" size="sm" onClick={invertCampaignSelection}>
                Inverseaza
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllCampaignUsers}>
                Deselecteaza toti
              </Button>
            </div>

            <div className="max-h-[360px] overflow-auto rounded-xl border border-zinc-200">
              <div className="divide-y divide-zinc-100">
                {filteredCampaignUsers.map((user) => {
                  const checked = selectedCampaignUserIds.includes(user._id);
                  const paymentsCount = Array.isArray(user?.payments) ? user.payments.length : 0;
                  const eligible = campaignEligibleUsers.some((candidate) => candidate._id === user._id);
                  const fullName = `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim();

                  return (
                    <label
                      key={user._id}
                      className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-zinc-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCampaignUser(user._id)}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium text-zinc-900">{user.user}</div>
                          {eligible ? (
                            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                              Eligibil
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-500">
                              In afara filtrelor
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {fullName || "Fara nume"} · plan {user?.plan || "free"} · {paymentsCount} plati
                          · email {user?.emailVerified === false ? "neverificat" : "verificat"}
                        </div>
                        {user?.profile?.eventName && (
                          <div className="mt-1 text-xs text-zinc-500">
                            Eveniment: {user.profile.eventName}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                HTML campanie
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignDraft(createFeedbackCampaignDraft())}
                >
                  Reset template
                </Button>
                <Button onClick={sendFeedbackCampaign} disabled={sendingCampaign}>
                  <Send className="w-4 h-4 mr-2" />
                  {sendingCampaign ? "Se porneste..." : "Porneste campania"}
                </Button>
              </div>
            </div>
            <textarea
              value={campaignDraft.html}
              onChange={(e) =>
                setCampaignDraft((prev) => ({ ...prev, html: e.target.value }))
              }
              className="min-h-[340px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200/80">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-500" />
                Istoric campanii feedback
              </CardTitle>
              <CardDescription>
                Vezi ce ai trimis, cine a vizitat formularul, ce raspuns a venit si cine a
                raspuns direct pe email.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void loadCampaigns(selectedCampaignId)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reincarca
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
            <div className="space-y-3">
              <select
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={selectedCampaignId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedCampaignId(nextId);
                  void loadCampaignDetail(nextId);
                }}
              >
                <option value="">Alege campania</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.title} - {campaign.status}
                  </option>
                ))}
              </select>

              <div className="space-y-3">
                {campaigns.map((campaign) => {
                  const isActive = selectedCampaignId === campaign._id;
                  return (
                    <button
                      key={campaign._id}
                      type="button"
                      onClick={() => {
                        setSelectedCampaignId(campaign._id);
                        void loadCampaignDetail(campaign._id);
                      }}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-all",
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-zinc-200 bg-white hover:border-zinc-300",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-zinc-900">{campaign.title}</div>
                        <Badge variant={isActive ? "default" : "outline"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-zinc-500">
                        {campaign?.stats?.sent || 0} trimise, {campaign?.stats?.submitted || 0} raspunsuri
                      </div>
                    </button>
                  );
                })}
                {!campaigns.length && !loadingCampaigns && (
                  <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
                    Nu exista campanii inca.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedCampaignDetail?.campaign ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      ["Trimise", selectedCampaignDetail.campaign?.stats?.sent || 0],
                      ["Deschise", selectedCampaignDetail.campaign?.stats?.opened || 0],
                      ["Vizite", selectedCampaignDetail.campaign?.stats?.visited || 0],
                      ["Formulare", selectedCampaignDetail.campaign?.stats?.submitted || 0],
                      ["Reply", selectedCampaignDetail.campaign?.stats?.replied || 0],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-xl border border-zinc-200 bg-white p-4 text-sm"
                      >
                        <div className="text-xs uppercase tracking-wide text-zinc-500">
                          {label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-zinc-900">
                          {value as any}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                    <div className="font-semibold text-zinc-900">{selectedCampaignDetail.campaign.title}</div>
                    <div className="mt-1">Subiect: {selectedCampaignDetail.campaign.subject}</div>
                    <div className="mt-1">
                      Creata:{" "}
                      {selectedCampaignDetail.campaign.createdAt
                        ? new Date(selectedCampaignDetail.campaign.createdAt).toLocaleString("ro-RO")
                        : "-"}
                    </div>
                    <div className="mt-1">Status: {selectedCampaignDetail.campaign.status}</div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                    <table className="min-w-full text-sm">
                      <thead className="bg-zinc-50 text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-left font-semibold">Vizite</th>
                          <th className="px-4 py-3 text-left font-semibold">Alegere</th>
                          <th className="px-4 py-3 text-left font-semibold">Mesaj formular</th>
                          <th className="px-4 py-3 text-left font-semibold">Reply email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedCampaignDetail.recipients || []).map((recipient: any) => (
                          <tr key={recipient._id} className="border-t border-zinc-100 align-top">
                            <td className="px-4 py-3">
                              <div className="font-medium text-zinc-900">{recipient.email}</div>
                              <div className="text-xs text-zinc-500">{recipient.name || "-"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{recipient.status}</Badge>
                            </td>
                            <td className="px-4 py-3">{recipient.visitCount || 0}</td>
                            <td className="px-4 py-3">{recipient.answerChoice || "-"}</td>
                            <td className="px-4 py-3 max-w-[260px] whitespace-pre-wrap text-zinc-700">
                              {recipient.answerText || "-"}
                            </td>
                            <td className="px-4 py-3 max-w-[260px] whitespace-pre-wrap text-zinc-700">
                              {recipient.lastReplyPreview || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-sm text-zinc-500">
                  Alege o campanie din stanga pentru a vedea detaliile.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCenter;

