import { apiService } from '../utils/apiService';
import type { PlanUsage } from '../interfaces/planUsage.interface';

// Plan de una empresa, su empresa primaria y el uso de cada uno de sus límites.
class PlanUsageService {
    static async getByCompanyId(companyId: number): Promise<PlanUsage> {
        const res = await apiService.get(`/saas/plan-usage/${companyId}`);
        return res.data.data;
    }
}

export default PlanUsageService;
