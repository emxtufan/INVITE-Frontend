import { UserSession } from "../types";

export const isPaymentRequired = (
  session?: Partial<UserSession> | null,
) => {
  if (!session || session.isAdmin === true) return false;
  const plan = String(session.plan || "free").toLowerCase();
  return plan !== "basic" && plan !== "premium";
};
