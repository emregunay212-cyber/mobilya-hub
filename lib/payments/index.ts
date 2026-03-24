import type { PaymentProvider } from "./types";
import type { PaymentConfig } from "@/lib/types/database";
import { IyzicoProvider } from "./iyzico";
import { StripeProvider } from "./stripe";

export type { PaymentProvider, PaymentRequest, PaymentResult, BuyerInfo, PaymentItem } from "./types";

/**
 * Create a payment provider instance from store payment config.
 */
export function createPaymentProvider(config: PaymentConfig): PaymentProvider | null {
  switch (config.provider) {
    case "iyzico":
      return new IyzicoProvider({
        apiKey: config.config.api_key || "",
        secretKey: config.config.secret_key || "",
        baseUrl: config.is_live
          ? "https://api.iyzipay.com"
          : "https://sandbox-api.iyzipay.com",
      });

    case "stripe":
      return new StripeProvider({
        secretKey: config.config.secret_key || "",
        webhookSecret: config.config.webhook_secret || "",
      });

    case "none":
    default:
      return null;
  }
}
