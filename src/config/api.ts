
const FALLBACK_API_URL = "https://api.event-smart-assistant.com/api";

const normalizeApiUrl = (value?: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return FALLBACK_API_URL;
  return trimmed.replace(/\/+$/, "");
};

const viteEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

export const API_URL = normalizeApiUrl(viteEnv?.VITE_API_URL);
export const API_ORIGIN = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "https://api.event-smart-assistant.com";
  }
})();

const normalizeUploadPath = (value: string) => {
  const withoutLeadingDots = value.replace(/^\.+/, "");
  const withoutKnownDomain = withoutLeadingDots
    .replace(/^https?:\/\/(?:www\.)?event-smart-assistant\.com/i, "")
    .replace(/^https?:\/\/api\.event-smart-assistant\.com/i, "")
    .replace(/^(?:www\.)?event-smart-assistant\.com/i, "")
    .replace(/^api\.event-smart-assistant\.com/i, "");

  const withLeadingSlash = withoutKnownDomain.startsWith("/")
    ? withoutKnownDomain
    : `/${withoutKnownDomain}`;

  return withLeadingSlash.replace(/^\/api\/uploads\//, "/uploads/");
};

export const resolveMediaUrl = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  if (
    /^data:/i.test(raw) ||
    /^blob:/i.test(raw) ||
    /^https?:\/\//i.test(raw) ||
    /^\/(?!uploads\/|api\/uploads\/)/i.test(raw)
  ) {
    return raw;
  }

  const normalizedPath = normalizeUploadPath(raw);
  if (!/^\/uploads\//i.test(normalizedPath)) {
    return raw;
  }

  return `${API_ORIGIN}${normalizedPath}`;
};

export const normalizeMediaFieldsDeep = <T,>(value: T): T => {
  if (typeof value === "string") {
    const resolved = resolveMediaUrl(value);
    if (resolved !== value) {
      return resolved as T;
    }

    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.stringify(normalizeMediaFieldsDeep(JSON.parse(value))) as T;
      } catch {
        return value;
      }
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeMediaFieldsDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    const normalizedEntries = Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => [key, normalizeMediaFieldsDeep(nestedValue)],
    );
    return Object.fromEntries(normalizedEntries) as T;
  }

  return value;
};
