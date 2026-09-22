// Uso de un límite del plan — `max` en null cuando el plan lo tiene ilimitado.
export interface PlanLimitUsage {
    used: number;
    max: number | null;
}

// Empresa titular de la suscripción — puede ser la misma empresa consultada.
export interface PlanPrimaryCompany {
    companyId: number;
    tenantId: string;
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
