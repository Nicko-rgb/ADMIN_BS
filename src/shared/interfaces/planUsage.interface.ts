// Uso de un límite del plan — `max` en null cuando el plan lo tiene ilimitado.
export interface PlanLimitUsage {
    used: number;
    max: number | null;
}

export interface PlanUsage {
    planName: string;
    subsidiaries: PlanLimitUsage;
    users: PlanLimitUsage;
    spaces: PlanLimitUsage;
    invoicesMonthly: PlanLimitUsage;
}
