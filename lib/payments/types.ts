export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  buyer: BuyerInfo;
  items: PaymentItem[];
  callbackUrl: string;
}

export interface BuyerInfo {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  identityNumber?: string;
}

export interface PaymentItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyCallback(body: unknown, headers?: Record<string, string>): Promise<{ valid: boolean; orderId?: string; paymentId?: string }>;
}
