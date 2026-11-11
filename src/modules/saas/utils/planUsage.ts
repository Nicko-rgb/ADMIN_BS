import type { PlanLimitUsage, PlanUsageAlert, PlanUsageOverview } from '../interfaces/planUsage.interface';

// Si queda cupo en un límite del plan — `max` null es ilimitado, y sin dato todavía deja pasar.
export const hasPlanRoom = (value?: PlanLimitUsage | null): boolean => (
    !value || value.max === null || value.used < value.max
);

export const formatPlanLimit = (max: number | null): string => max === null ? 'Sin límite' : String(max);

export const describePlanUsage = ({ used, max }: PlanLimitUsage): string => {
    if (max === null) return 'Sin límite de uso';
    if (max === 0 && used === 0) return 'No incluido en este plan';
    if (used > max) return `${used - max} por encima del límite`;
    if (used === max) return 'Límite alcanzado';
    return `${max - used} disponibles`;
};

export const getPlanUsageAlerts = (overview: PlanUsageOverview): PlanUsageAlert[] => {
    const alerts: PlanUsageAlert[] = [];
    const check = (key: string, label: string, value: PlanLimitUsage) => {
        if (value.max === null || value.used === 0 || value.used < value.max * 0.8) return;
        const full = value.used >= value.max;
        alerts.push({
            key,
            tone: full ? 'danger' : 'warning',
            message: `${label}: ${value.used} de ${value.max}. ${full ? 'Límite alcanzado.' : 'Te acercas al límite.'}`,
        });
    };

    // Un plan de una empresa no necesita alertar por su propia empresa titular.
    if (overview.companies.max !== null && overview.companies.used > overview.companies.max) {
        check('companies', 'Empresas del plan', overview.companies);
    }
    for (const company of overview.companyUsage) {
        check(`${company.publicId}-branches`, `${company.name} · Sucursales`, company.subsidiaries);
        check(`${company.publicId}-users`, `${company.name} · Usuarios`, company.users);
        for (const branch of company.branches) {
            check(`${branch.publicId}-spaces`, `${company.name} / ${branch.name} · Canchas`, branch.spaces);
            if (branch.invoicesMonthly.used !== null) {
                check(`${branch.publicId}-invoices`, `${company.name} / ${branch.name} · Facturas`, {
                    used: branch.invoicesMonthly.used,
                    max: branch.invoicesMonthly.max,
                });
            }
        }
    }
    return alerts;
};
