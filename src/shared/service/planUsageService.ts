import { apiService } from '../utils/apiService';
import type { PlanUsage } from '../interfaces/planUsage.interface';

// Plan de una empresa y el uso de cada uno de sus límites.
class PlanUsageService {
    static async getByTenantId(tenantId: string): Promise<PlanUsage> {
        const res = await apiService.get(`/saas/plan-usage/${tenantId}`);
        return res.data.data;
    }
}

export default PlanUsageService;
