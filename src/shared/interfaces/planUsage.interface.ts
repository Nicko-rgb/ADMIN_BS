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

export interface PlanUsage {
    planName: string;
    primaryCompany: PlanPrimaryCompany | null;
    subsidiaries: PlanLimitUsage;
    users: PlanLimitUsage;
    spaces: PlanLimitUsage;
    invoicesMonthly: PlanLimitUsage;
}
