import { apiService } from '../../../shared/utils/apiService';
import type { PlanUsage, PlanUsageOverview } from '../interfaces/planUsage.interface';

// Plan de una empresa, su empresa primaria y el uso de cada uno de sus límites.
class PlanUsageService {
    static async getOverview(companyPublicId: string): Promise<PlanUsageOverview> {
        const res = await apiService.get(`/saas/plan-usage/${companyPublicId}/overview`);
        return res.data.data;
    }

    static async getByCompanyPublicId(companyPublicId: string): Promise<PlanUsage> {
        const res = await apiService.get(`/saas/plan-usage/${companyPublicId}`);
        return res.data.data;
    }
}

export default PlanUsageService;
