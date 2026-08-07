declare module 'react-native-razorpay' {
  export type RazorpayCheckoutOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
      name?: string | null;
      email?: string | null;
      contact?: string | number | null;
    };
    theme?: {
      color?: string;
    };
  };

  export type RazorpayCheckoutSuccess = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  const RazorpayCheckout: {
    open(
      options: RazorpayCheckoutOptions,
    ): Promise<RazorpayCheckoutSuccess>;
  };

  export default RazorpayCheckout;
}
