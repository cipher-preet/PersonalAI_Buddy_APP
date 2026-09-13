import type { Plan, PlanCode } from '../../store/api/payments';

export type UiPlanId = PlanCode;
export type BillingCycle = 'monthly' | 'quarterly';
export type PlanVariant = 'light' | 'featured' | 'premium';

export type PlanLanguage = {
  name: string;
};

export type PlanFeature = {
  id: string;
  label: string;
};

export type UiPlan = {
  id: UiPlanId;
  backendCode: PlanCode;
  name: string;
  tagline: string;
  badge?: string;
  variant: PlanVariant;
  prices: Record<BillingCycle, string>;
  amountInr: Record<BillingCycle, number>;
  cadenceLabel: Record<BillingCycle, string>;
  features: PlanFeature[];
  languages: PlanLanguage[];
  languageSummary: string;
  limits: {
    spaces: number;
    recordingHours: number;
  };
};

type PlanPresentation = {
  variant: PlanVariant;
  badge?: string;
};

const PLAN_PRESENTATION: Record<PlanCode, PlanPresentation> = {
  free: {
    variant: 'light',
  },
  pro: {
    variant: 'featured',
    badge: 'Popular',
  },
  business: {
    variant: 'premium',
    badge: 'Best value',
  },
};

export const BILLING_OPTIONS: { id: BillingCycle; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
];

export const CYCLE_CADENCE: Record<BillingCycle, string> = {
  monthly: 'month',
  quarterly: 'quarter',
};

const paiseToInr = (paise = 0) => Math.round(paise / 100);

const formatInr = (paise = 0) => {
  const amount = paiseToInr(paise);
  return amount === 0 ? '₹0' : `₹${amount.toLocaleString('en-IN')}`;
};

const formatLimit = (value: number, suffix = '') => {
  if (value < 0) {
    return 'Unlimited';
  }

  return `${value}${suffix}`;
};

const hasFeature = (features: string[], needle: string) =>
  features.some(feature => feature.toLowerCase().includes(needle.toLowerCase()));

export const mapApiPlanToUi = (plan: Plan): UiPlan => {
  const presentation = PLAN_PRESENTATION[plan.code] ?? PLAN_PRESENTATION.free;
  const isFree = plan.code === 'free' || plan.amount === 0;
  const languages = (plan.languages || []).map(name => ({ name }));

  return {
    id: plan.code,
    backendCode: plan.code,
    name: plan.name,
    tagline: plan.description,
    badge: presentation.badge,
    variant: presentation.variant,
    prices: {
      monthly: formatInr(plan.amount),
      quarterly: formatInr(plan.quarterlyAmount),
    },
    amountInr: {
      monthly: paiseToInr(plan.amount),
      quarterly: paiseToInr(plan.quarterlyAmount),
    },
    cadenceLabel: {
      monthly: isFree ? 'forever' : 'month',
      quarterly: isFree ? 'forever' : 'quarter',
    },
    features: plan.features.map((label, index) => ({
      id: `${plan.code}-${index}`,
      label,
    })),
    languages,
    languageSummary: languages.map(item => item.name).join(' · '),
    limits: {
      spaces: plan.limits?.spaces ?? 0,
      recordingHours: plan.limits?.recordingHours ?? 0,
    },
  };
};

export const mapApiPlansToUi = (plans?: Plan[]) =>
  (plans || [])
    .filter(plan => plan.code === 'free' || plan.code === 'pro' || plan.code === 'business')
    .sort((left, right) => {
      const order: PlanCode[] = ['free', 'pro', 'business'];
      return order.indexOf(left.code) - order.indexOf(right.code);
    })
    .map(mapApiPlanToUi);

export type CompareIcon =
  | 'spaces'
  | 'recording'
  | 'languages'
  | 'briefing'
  | 'goals'
  | 'team';

export type CompareRow = {
  id: string;
  label: string;
  description: string;
  icon: CompareIcon;
  values: Partial<Record<PlanCode, string>>;
};

export const buildCompareRows = (plans: UiPlan[]): CompareRow[] => {
  const byCode = Object.fromEntries(plans.map(plan => [plan.id, plan])) as Partial<
    Record<PlanCode, UiPlan>
  >;

  const valueFor = (
    code: PlanCode,
    read: (plan: UiPlan) => string,
  ) => (byCode[code] ? read(byCode[code] as UiPlan) : '—');

  return [
    {
      id: 'spaces',
      label: 'More spaces',
      description: 'Organize work across dedicated spaces',
      icon: 'spaces',
      values: {
        free: valueFor('free', plan => formatLimit(plan.limits.spaces)),
        pro: valueFor('pro', plan => formatLimit(plan.limits.spaces)),
        business: valueFor('business', plan => formatLimit(plan.limits.spaces)),
      },
    },
    {
      id: 'recording',
      label: 'Meeting recording',
      description: 'Capture conversations with included hours',
      icon: 'recording',
      values: {
        free: valueFor('free', plan => formatLimit(plan.limits.recordingHours, ' hrs')),
        pro: valueFor('pro', plan => formatLimit(plan.limits.recordingHours, ' hrs')),
        business: valueFor('business', plan =>
          formatLimit(plan.limits.recordingHours, ' hrs'),
        ),
      },
    },
    {
      id: 'languages',
      label: 'Language pack',
      description: 'Speak and listen in more Indian languages',
      icon: 'languages',
      values: {
        free: valueFor('free', plan => String(plan.languages.length || '—')),
        pro: valueFor('pro', plan => String(plan.languages.length || '—')),
        business: valueFor('business', plan => String(plan.languages.length || '—')),
      },
    },
    {
      id: 'briefing',
      label: 'Daily briefing',
      description: 'Personalized summary from your day',
      icon: 'briefing',
      values: {
        free: valueFor('free', plan =>
          hasFeature(plan.features.map(item => item.label), 'briefing') ? 'Yes' : '—',
        ),
        pro: valueFor('pro', plan =>
          hasFeature(plan.features.map(item => item.label), 'briefing') ? 'Yes' : '—',
        ),
        business: valueFor('business', plan =>
          hasFeature(plan.features.map(item => item.label), 'briefing') ? 'Yes' : '—',
        ),
      },
    },
    {
      id: 'goals',
      label: 'Goal monitor',
      description: 'Track outcomes across every space',
      icon: 'goals',
      values: {
        free: valueFor('free', plan =>
          hasFeature(plan.features.map(item => item.label), 'goal') ? 'Yes' : '—',
        ),
        pro: valueFor('pro', plan =>
          hasFeature(plan.features.map(item => item.label), 'goal') ? 'Yes' : '—',
        ),
        business: valueFor('business', plan =>
          hasFeature(plan.features.map(item => item.label), 'goal') ? 'Yes' : '—',
        ),
      },
    },
    {
      id: 'team',
      label: 'Team access',
      description: 'Collaborate with shared workspaces',
      icon: 'team',
      values: {
        free: valueFor('free', plan =>
          hasFeature(plan.features.map(item => item.label), 'team') ? 'Yes' : '—',
        ),
        pro: valueFor('pro', plan =>
          hasFeature(plan.features.map(item => item.label), 'team') ? 'Yes' : '—',
        ),
        business: valueFor('business', plan =>
          hasFeature(plan.features.map(item => item.label), 'team') ? 'Yes' : '—',
        ),
      },
    },
  ];
};

export const buildPlanFaqs = (plans: UiPlan[]) => {
  const pro = plans.find(plan => plan.id === 'pro');
  const business = plans.find(plan => plan.id === 'business');
  const languages = business?.languages.map(item => item.name).join(', ');

  return [
    {
      q: 'Can I change plans later?',
      a: 'Yes. Switch between Free, Pro, and Business anytime. Your spaces and recordings stay with you.',
    },
    {
      q: 'What does quarterly billing include?',
      a: `Pro is ${pro?.prices.quarterly || '—'} for 3 months. Business is ${
        business?.prices.quarterly || '—'
      } for 3 months. You can still pay monthly if you prefer.`,
    },
    {
      q: 'Which languages does Business unlock?',
      a: languages
        ? `${languages}.`
        : 'Business includes 11 Indian languages.',
    },
  ];
};

export const getQuarterlyHint = (plan: UiPlan) => {
  if (plan.amountInr.monthly <= 0) {
    return null;
  }

  const monthlyTotal = plan.amountInr.monthly * 3;
  const saved = monthlyTotal - plan.amountInr.quarterly;

  if (saved <= 0) {
    return null;
  }

  return `Save ₹${saved.toLocaleString('en-IN')} vs monthly`;
};
