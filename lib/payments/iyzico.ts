import type { PaymentProvider, PaymentRequest, PaymentResult } from "./types";

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export class IyzicoProvider implements PaymentProvider {
  name = "iyzico";
  private config: IyzicoConfig;

  constructor(config: IyzicoConfig) {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Dynamic import to avoid bundling iyzipay in client
      const Iyzipay = (await import("iyzipay")).default;

      const iyzipay = new Iyzipay({
        apiKey: this.config.apiKey,
        secretKey: this.config.secretKey,
        uri: this.config.baseUrl,
      });

      const paymentRequest = {
        locale: "tr",
        conversationId: request.orderId,
        price: request.amount.toFixed(2),
        paidPrice: request.amount.toFixed(2),
        currency: request.currency === "TRY" ? "TRY" : request.currency,
        installment: "1",
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        callbackUrl: request.callbackUrl,
        buyer: {
          id: request.buyer.email,
          name: request.buyer.name,
          surname: request.buyer.surname,
          email: request.buyer.email,
          gsmNumber: request.buyer.phone,
          identityNumber: request.buyer.identityNumber || "11111111111",
          registrationAddress: request.buyer.address,
          city: request.buyer.city,
          country: "Turkey",
        },
        shippingAddress: {
          contactName: `${request.buyer.name} ${request.buyer.surname}`,
          city: request.buyer.city,
          country: "Turkey",
          address: request.buyer.address,
        },
        billingAddress: {
          contactName: `${request.buyer.name} ${request.buyer.surname}`,
          city: request.buyer.city,
          country: "Turkey",
          address: request.buyer.address,
        },
        basketItems: request.items.map((item, i) => ({
          id: item.id,
          name: item.name,
          category1: item.category,
          itemType: "PHYSICAL",
          price: (item.price * item.quantity).toFixed(2),
        })),
      };

      return new Promise((resolve) => {
        iyzipay.checkoutFormInitialize.create(paymentRequest, (err: unknown, result: Record<string, unknown>) => {
          if (err || result.status !== "success") {
            resolve({
              success: false,
              error: (result?.errorMessage as string) || "iyzico ödeme başlatılamadı",
            });
          } else {
            resolve({
              success: true,
              paymentId: result.token as string,
              redirectUrl: result.checkoutFormContent as string,
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: `iyzico hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      };
    }
  }

  async verifyCallback(body: unknown): Promise<{ valid: boolean; orderId?: string; paymentId?: string }> {
    try {
      const Iyzipay = (await import("iyzipay")).default;
      const iyzipay = new Iyzipay({
        apiKey: this.config.apiKey,
        secretKey: this.config.secretKey,
        uri: this.config.baseUrl,
      });

      const token = (body as Record<string, string>)?.token;
      if (!token) return { valid: false };

      return new Promise((resolve) => {
        iyzipay.checkoutForm.retrieve({ token }, (err: unknown, result: Record<string, unknown>) => {
          if (err || result.paymentStatus !== "SUCCESS") {
            resolve({ valid: false });
          } else {
            resolve({
              valid: true,
              orderId: result.conversationId as string,
              paymentId: result.paymentId as string,
            });
          }
        });
      });
    } catch {
      return { valid: false };
    }
  }
}
