import { UserSession } from "../types";

export const isPaymentRequired = (
  session?: Partial<UserSession> | null,
) => {
  if (!session || session.isAdmin === true) return false;
  const hasPaidPayment = session.payments?.some(
    (payment) => String(payment.status || "").toLowerCase() === "paid",
  );
  return (
    session.requiresPayment === true ||
    session.plan === "free" ||
    !hasPaidPayment
  );
};
