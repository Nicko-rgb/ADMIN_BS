import { useCallback, useEffect, useState } from 'react';
import PlanUsageService from '../service/planUsageService';
import { handleApiError } from '../utils/errorHandler';
import toast from '../utils/toast';
import type { PlanUsage } from '../interfaces/planUsage.interface';

/**
 * Plan de una empresa, el uso de cada límite y su nivel de notificaciones ('basic' | 'full').
 * `planUsage` es null mientras carga; `reloadPlanUsage` lo vuelve a pedir.
 */
export const usePlanUsage = (companyId?: number) => {
    const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        if (!companyId) return;

        let isCurrent = true;
        PlanUsageService.getByCompanyId(companyId)
            .then((data) => isCurrent && setPlanUsage(data))
            .catch((err) => isCurrent && toast.error(handleApiError(err)));

        return () => { isCurrent = false; };
    }, [companyId, reloadToken]);

    const reloadPlanUsage = useCallback(() => setReloadToken((token) => token + 1), []);

    return { planUsage , notificationsTier: planUsage?.notificationsTier ?? null, reloadPlanUsage };
};

export default usePlanUsage;
