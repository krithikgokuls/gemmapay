import { Invoice, BusinessProfile } from '../types';

const INVOICES_STORAGE_KEY = 'gemmapay_invoices_v1';
const BUSINESS_PROFILE_KEY = 'gemmapay_business_profile_v1';
const MONTHLY_GOAL_KEY = 'gemmapay_monthly_goal_v1';

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Studio Nova | Design & Code',
  email: 'alex@studionova.dev',
  phone: '+1 (555) 234-5678',
  address: '742 Evergreen Suite 4B, Austin, TX 78701',
  taxNumber: 'TX-883921-A',
  paymentDetails: {
    method: 'stripe',
    accountInfo: 'alex@studionova.dev (Direct Wire or Stripe)',
    paymentLink: 'https://buy.stripe.com/demo_sidehustle_invoice',
  },
};

export const INITIAL_SEEDED_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-042',
    issueDate: '2026-09-25',
    dueDate: '2026-10-09',
    status: 'overdue',
    currency: 'USD',
    clientName: 'Coastal Brew Co.',
    clientEmail: 'billing@coastalbrew.com',
    clientAddress: '104 Ocean Drive, San Diego, CA',
    businessName: 'Studio Nova | Design & Code',
    businessEmail: 'alex@studionova.dev',
    businessAddress: '742 Evergreen Suite 4B, Austin, TX',
    lineItems: [
      {
        id: 'li-1',
        description: 'Brand Identity Design & Can Packaging Layouts',
        quantity: 1,
        rate: 950,
        amount: 950,
      },
      {
        id: 'li-2',
        description: 'Commercial Font & Asset Licensing Pass-through',
        quantity: 1,
        rate: 200,
        amount: 200,
      },
      {
        id: 'li-3',
        description: 'Social Media Launch Templates (6 Formats)',
        quantity: 1,
        rate: 300,
        amount: 300,
      },
    ],
    subtotal: 1450,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    depositPaid: 450,
    totalDue: 1000,
    paymentTerms: 'Payment due within 14 days. 1.5% late fee per month applies after due date.',
    paymentInstructions: 'Please pay via Stripe invoice link or direct bank wire.',
    notes: 'Thank you for partnering with Studio Nova on the Fall launch!',
    sideHustleCategory: 'Brand Identity & Packaging',
    estimatedHoursWorked: 16,
    effectiveHourlyRate: 90,
    theme: 'emerald',
    createdAt: '2026-09-25T10:00:00.000Z',
    followUpCount: 1,
    lastFollowUpAt: '2026-10-10T14:30:00.000Z',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-043',
    issueDate: '2026-10-01',
    dueDate: '2026-10-22',
    status: 'pending',
    currency: 'USD',
    clientName: 'Apex Cloud Solutions',
    clientEmail: 'accounts@apexcloud.io',
    clientAddress: '500 Technology Square, Boston, MA',
    businessName: 'Studio Nova | Design & Code',
    businessEmail: 'alex@studionova.dev',
    businessAddress: '742 Evergreen Suite 4B, Austin, TX',
    lineItems: [
      {
        id: 'li-201',
        description: 'Next.js & Tailwind Analytics Dashboard Frontend Integration',
        quantity: 24,
        rate: 85,
        amount: 2040,
      },
      {
        id: 'li-202',
        description: 'Responsive Mobile Optimization & Accessibility Audit',
        quantity: 6,
        rate: 85,
        amount: 510,
      },
    ],
    subtotal: 2550,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    depositPaid: 0,
    totalDue: 2550,
    paymentTerms: 'Net 21 days upon electronic invoice delivery.',
    paymentInstructions: 'ACH Transfer to First Austin Bank / Routing: 111928374',
    notes: 'Code repository transferred to apexcloud/analytics-ui on GitHub.',
    sideHustleCategory: 'Web Development',
    estimatedHoursWorked: 30,
    effectiveHourlyRate: 85,
    theme: 'navy',
    createdAt: '2026-10-01T15:20:00.000Z',
    followUpCount: 0,
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-040',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    status: 'paid',
    currency: 'USD',
    clientName: 'Bloom Floral Studio',
    clientEmail: 'chloe@bloomfloral.shop',
    clientAddress: '18 Magnolia Way, Savannah, GA',
    businessName: 'Studio Nova | Design & Code',
    businessEmail: 'alex@studionova.dev',
    businessAddress: '742 Evergreen Suite 4B, Austin, TX',
    lineItems: [
      {
        id: 'li-301',
        description: 'Shopify Store Setup & Custom Bouquet Subscription Config',
        quantity: 1,
        rate: 850,
        amount: 850,
      },
      {
        id: 'li-302',
        description: 'Local Delivery Radius Zone Integration',
        quantity: 1,
        rate: 150,
        amount: 150,
      },
    ],
    subtotal: 1000,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 50,
    depositPaid: 0,
    totalDue: 950,
    paymentTerms: 'Due upon completion.',
    paymentInstructions: 'Venmo @StudioNova-Alex or Stripe card checkout.',
    notes: 'Paid in full on Sept 22, 2026. Chloe left a 5-star review!',
    sideHustleCategory: 'E-Commerce Setup',
    estimatedHoursWorked: 11,
    effectiveHourlyRate: 86,
    theme: 'amber',
    createdAt: '2026-09-10T09:00:00.000Z',
    followUpCount: 2,
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV-2026-044',
    issueDate: '2026-10-08',
    dueDate: '2026-10-15',
    status: 'pending',
    currency: 'USD',
    clientName: 'Urban Fitness Lab',
    clientEmail: 'marcus@urbanfitnesslab.com',
    clientAddress: '88 Broadway, Denver, CO',
    businessName: 'Studio Nova | Design & Code',
    businessEmail: 'alex@studionova.dev',
    businessAddress: '742 Evergreen Suite 4B, Austin, TX',
    lineItems: [
      {
        id: 'li-401',
        description: 'Monthly Social Media Video Reel Editing Retainer (October)',
        quantity: 1,
        rate: 750,
        amount: 750,
      },
    ],
    subtotal: 750,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    depositPaid: 0,
    totalDue: 750,
    paymentTerms: 'Monthly recurring retainer due by 15th of active month.',
    paymentInstructions: 'Auto-debit or Stripe recurring link.',
    notes: 'Includes 8 vertical shorts and sound licensing.',
    sideHustleCategory: 'Video & Content Retainer',
    estimatedHoursWorked: 8,
    effectiveHourlyRate: 93,
    theme: 'emerald',
    createdAt: '2026-10-08T11:00:00.000Z',
    followUpCount: 0,
  },
];

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) {
      saveInvoices(INITIAL_SEEDED_INVOICES);
      return INITIAL_SEEDED_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEEDED_INVOICES;
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices to localStorage', e);
  }
}

export function loadBusinessProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(BUSINESS_PROFILE_KEY);
    if (!raw) {
      saveBusinessProfile(DEFAULT_BUSINESS_PROFILE);
      return DEFAULT_BUSINESS_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BUSINESS_PROFILE;
  }
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(BUSINESS_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save business profile', e);
  }
}

export function loadMonthlyGoal(): number {
  try {
    const val = localStorage.getItem(MONTHLY_GOAL_KEY);
    return val ? parseFloat(val) : 3500;
  } catch {
    return 3500;
  }
}

export function saveMonthlyGoal(goal: number): void {
  try {
    localStorage.setItem(MONTHLY_GOAL_KEY, goal.toString());
  } catch (e) {
    console.error('Failed to save monthly goal', e);
  }
}
