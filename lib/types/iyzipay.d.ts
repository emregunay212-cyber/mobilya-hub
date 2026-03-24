declare module "iyzipay" {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface IyzipayCallback {
    (err: unknown, result: Record<string, unknown>): void;
  }

  class Iyzipay {
    constructor(config: IyzipayConfig);
    checkoutFormInitialize: {
      create(request: Record<string, unknown>, callback: IyzipayCallback): void;
    };
    checkoutForm: {
      retrieve(request: { token: string }, callback: IyzipayCallback): void;
    };
  }

  export default Iyzipay;
}
