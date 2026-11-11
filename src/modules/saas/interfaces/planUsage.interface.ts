// Uso de un límite del plan — `max` en null cuando el plan lo tiene ilimitado.
export interface PlanLimitUsage {
    used: number;
    max: number | null;
}

// Empresa titular de la suscripción — puede ser la misma empresa consultada.
export interface PlanPrimaryCompany {
    publicId: string;
    name: string;
}

// Nivel de notificaciones del plan: 'basic' (solo email) o 'full' (todos los canales).
export type PlanNotificationsTier = 'basic' | 'full';

export interface PlanUsage {
    planName: string;
    notificationsTier: PlanNotificationsTier;
    primaryCompany: PlanPrimaryCompany | null;
    subsidiaries: PlanLimitUsage;
    users: PlanLimitUsage;
    spaces: PlanLimitUsage;
    invoicesMonthly: PlanLimitUsage;
}
import type { CompanySubscription } from './subscription.interface';


export interface PlanBranchUsage {
    publicId: string;
    name: string;
    spaces: PlanLimitUsage;
    invoicesMonthly: { used: number | null; max: number | null };
}

export interface PlanCompanyUsage extends PlanPrimaryCompany {
    isPrimary: boolean;
    subsidiaries: PlanLimitUsage;
    users: PlanLimitUsage;
    branches: PlanBranchUsage[];
}

export interface PlanUsageOverview {
    company: PlanPrimaryCompany;
    subscription: CompanySubscription;
    companies: PlanLimitUsage;
    companyUsage: PlanCompanyUsage[];
    invoicesTrackingAvailable: boolean;
    updatedAt: string;
}

export interface PlanUsageAlert {
    key: string;
    message: string;
    tone: 'warning' | 'danger';
}
