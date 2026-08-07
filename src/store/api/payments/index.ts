import { baseApi } from '../baseApi';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const unwrapApiData = <T>(response: unknown): T => {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'success' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
};

export type PlanCode = 'free' | 'pro';

export type PlanLimits = {
  spaces: number;
  notes: number;
  tasks: number;
};

export type Plan = {
  _id: string;
  code: PlanCode;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'forever' | 'monthly';
  limits: PlanLimits;
  features: string[];
  isActive: boolean;
};

export type PlanStatus = {
  subscription: {
    _id: string;
    planCode: PlanCode;
    status: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  plan: Plan;
  usage: PlanLimits;
};

export type PaymentOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: Plan;
  paymentId: string;
  requiresPayment: boolean;
  message?: string;
};

export type PaymentLink = {
  paymentId: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  plan: Plan;
  requiresPayment: boolean;
};

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPlans: builder.query<{ plans: Plan[] }, void>({
      query: () => ({
        url: 'plans',
        method: 'GET',
      }),
      providesTags: ['Plans'],
      transformResponse: response => unwrapApiData<{ plans: Plan[] }>(response),
    }),

    getPlanStatus: builder.query<PlanStatus, { userId: string }>({
      query: ({ userId }) => ({
        url: 'plans/status',
        method: 'GET',
        params: { userId },
      }),
      providesTags: ['Plans'],
      transformResponse: response => unwrapApiData<PlanStatus>(response),
    }),

    activateFreePlan: builder.mutation<
      { message?: string },
      { userId: string }
    >({
      query: body => ({
        url: 'plans/free',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Plans'],
      transformResponse: response =>
        unwrapApiData<{ message?: string }>(response),
    }),

    createPaymentOrder: builder.mutation<
      PaymentOrder,
      { userId: string; planCode: PlanCode }
    >({
      query: body => ({
        url: 'payments/order',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<PaymentOrder>(response),
    }),

    createPaymentLink: builder.mutation<
      PaymentLink,
      {
        userId: string;
        planCode: PlanCode;
        name?: string | null;
        email?: string | null;
        phone?: string | number | null;
      }
    >({
      query: body => ({
        url: 'payments/payment-link',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<PaymentLink>(response),
    }),

    verifyPayment: builder.mutation<
      { message?: string },
      {
        userId: string;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }
    >({
      query: body => ({
        url: 'payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Plans'],
      transformResponse: response =>
        unwrapApiData<{ message?: string }>(response),
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanStatusQuery,
  useActivateFreePlanMutation,
  useCreatePaymentLinkMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} = paymentsApi;
