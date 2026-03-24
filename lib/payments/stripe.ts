import type { PaymentProvider, PaymentRequest, PaymentResult } from "./types";

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export class StripeProvider implements PaymentProvider {
  name = "stripe";
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(this.config.secretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${request.callbackUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${request.callbackUrl}?status=cancelled`,
        client_reference_id: request.orderId,
        customer_email: request.buyer.email,
        line_items: request.items.map((item) => ({
          price_data: {
            currency: request.currency.toLowerCase(),
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // Stripe uses cents
          },
          quantity: item.quantity,
        })),
        metadata: {
          orderId: request.orderId,
        },
      });

      return {
        success: true,
        paymentId: session.id,
        redirectUrl: session.url || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `Stripe hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      };
    }
  }

  async verifyCallback(
    body: unknown,
    headers?: Record<string, string>
  ): Promise<{ valid: boolean; orderId?: string; paymentId?: string }> {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(this.config.secretKey);

      const sig = headers?.["stripe-signature"];
      if (!sig || typeof body !== "string") return { valid: false };

      const event = stripe.webhooks.constructEvent(body, sig, this.config.webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        return {
          valid: true,
          orderId: session.metadata?.orderId || session.client_reference_id || undefined,
          paymentId: session.id,
        };
      }

      return { valid: false };
    } catch {
      return { valid: false };
    }
  }
}
