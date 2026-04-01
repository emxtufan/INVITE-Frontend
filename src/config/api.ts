const ENV = (import.meta as any)?.env ?? {};
const RAW_VITE_API_URL = ENV?.VITE_API_URL;
const VITE_API_URL =
  typeof RAW_VITE_API_URL === "string" ? RAW_VITE_API_URL.trim() : "";
const ENV_MODE = typeof ENV?.MODE === "string" ? ENV.MODE : "";
const IS_LOCALHOST =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|::1)$/.test(window.location.hostname);
const IS_DEV =
  Boolean(ENV?.DEV) || ENV_MODE === "development" || IS_LOCALHOST;

if (!VITE_API_URL && !IS_DEV) {
  throw new Error(
    "Missing VITE_API_URL. Configure it in your production environment."
  );
}

export const API_URL = VITE_API_URL || "http://localhost:3005/api";
