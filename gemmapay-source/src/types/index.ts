export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber?: string;
  paymentDetails: {
    method: 'bank' | 'stripe' | 'paypal' | 'venmo' | 'cashapp';
    accountInfo: string;
    paymentLink?: string;
  };
}

export interface ClientProfile {
  id?: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  company?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  depositPaid: number;
  totalDue: number;
  paymentTerms: string;
  paymentInstructions: string;
  notes: string;
  sideHustleCategory?: string;
  estimatedHoursWorked?: number;
  effectiveHourlyRate?: number;
  theme?: 'emerald' | 'mono' | 'navy' | 'amber';
  createdAt: string;
  lastFollowUpAt?: string;
  followUpCount?: number;
}

export type FollowUpStage =
  | 'gentle_heads_up'
  | 'due_today'
  | 'polite_reminder'
  | 'urgent_escalation'
  | 'milestone_checkin'
  | 'post_project_review'
  | 'upsell_retainer';

export type FollowUpTone =
  | 'professional_warm'
  | 'casual_friendly'
  | 'crisp_direct'
  | 'firm_formal';

export interface GeneratedFollowUp {
  subject: string;
  emailBody: string;
  smsWhatsappBody: string;
  recommendedAction: string;
  sideHustleUpsellTip: string;
}

export interface PrivacyAuditResult {
  containsSensitivePII: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high';
  detectedItems: string[];
  sanitizedText: string;
  privacyAdvice: string;
}

export interface RateStrategy {
  recommendedHourlyRate: number;
  recommendedProjectPackage: {
    title: string;
    suggestedPrice: number;
    deliverables: string[];
  };
  hoursNeededToHitGoal: number;
  breakEvenClientCount: number;
  pricingTiers: {
    name: string;
    rate: string;
    description: string;
  }[];
  actionableAdvice: string;
}

export interface ModelEngineStatus {
  status: string;
  openWeightEngine: string;
  fallbackEngine: string;
  apiKeyConfigured: boolean;
  privacyStandard: string;
  costPerRun: string;
  localOllamaSupported: boolean;
}
