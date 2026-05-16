import { billingAPI, getToken } from "./api";

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** @param {"PRO"|"BUSINESS"} tier */
export async function startSubscriptionCheckout(tier) {
  if (!getToken()) {
    sessionStorage.setItem("rp_checkout_tier", tier);
    window.location.href = "/app";
    return { needsLogin: true };
  }

  const config = await billingAPI.config();
  if (!config.razorpayConfigured) {
    throw new Error("Payment server not configured. Contact support.");
  }

  const sub = await billingAPI.createSubscription(tier);
  const scriptOk = await loadRazorpayScript();
  if (!scriptOk || !window.Razorpay) {
    if (sub.shortUrl) {
      window.open(sub.shortUrl, "_blank", "noopener,noreferrer");
      return { openedShortUrl: true };
    }
    throw new Error("Could not load Razorpay checkout");
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: sub.keyId || config.keyId,
      subscription_id: sub.subscriptionId,
      name: "Thtwaat POS",
      description: `${tier} monthly plan`,
      handler: () => {
        sessionStorage.removeItem("rp_checkout_tier");
        resolve({ success: true });
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => reject(new Error("Payment failed")));
    rzp.open();
  });
}

export function resumeCheckoutAfterLogin() {
  const tier = sessionStorage.getItem("rp_checkout_tier");
  if (!tier || !getToken()) return null;
  sessionStorage.removeItem("rp_checkout_tier");
  return tier;
}
