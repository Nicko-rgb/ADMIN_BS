import type { PlanLimitUsage } from '../interfaces/planUsage.interface';

// Si queda cupo en un límite del plan — `max` null es ilimitado, y sin dato todavía deja pasar.
export const hasPlanRoom = (value?: PlanLimitUsage | null): boolean => (
    !value || value.max === null || value.used < value.max
);
