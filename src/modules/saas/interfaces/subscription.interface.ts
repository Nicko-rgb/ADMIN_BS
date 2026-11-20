import type { PlanNotificationsTier } from './planUsage.interface';

// Estados que puede devolver el backend (`SaaSSubscription.status`). `PENDING` es el alta
// iniciada pero no autorizada en la pasarela. La vigencia depende de `isEffective`.
export type SubscriptionStatus = 'PENDING' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE';

export type BillingPeriod = 'monthly' | 'yearly';

// Plan embebido en la suscripción — mismo shape que `toSubscriptionPlanDto` del backend.
export interface SubscriptionPlan {
    publicId: string;
    name: string;
    code: string;
    priceMonthly: string;
    priceYearly: string;
    maxSubsidiaries: number | null;
    maxSpaces: number | null;
    maxUsers: number | null;
    maxInvoicesMonthly: number | null;
    notificationsTier: PlanNotificationsTier;
    allowsMultiCompany: boolean;
    hasAdvancedReports: boolean;
    hasStripeConnect: boolean;
    features: string[] | null;
}

// Empresa titular de la suscripción (la que factura). Puede ser distinta de la consultada
// cuando el plan cubre varias empresas.
export interface SubscriptionPrimaryCompany {
    publicId: string;
    name: string;
}

// Suscripción que cubre a una empresa raíz — `GET /api/v2/saas/subscription/:companyPublicId/current-plan`.
export interface CompanySubscription {
    publicId: string;
    status: SubscriptionStatus;
    /** Vigencia persistida; una suscripción cancelada puede seguir concediendo acceso. */
    isEffective: boolean;
    plan: SubscriptionPlan | null;
    billingPeriod: BillingPeriod | null;
    gateway: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    /** Fecha de fin del período, usada como fecha prevista del próximo cobro. */
    nextInvoiceAt: string | null;
    primaryCompany: SubscriptionPrimaryCompany | null;
    createdAt: string;
    updatedAt: string;
}
