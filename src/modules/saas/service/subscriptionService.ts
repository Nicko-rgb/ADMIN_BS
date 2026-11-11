import { apiService } from '../../../shared/utils/apiService';
import type { CompanySubscription } from '../interfaces/subscription.interface';

// Suscripción de una empresa raíz: plan, estado comercial y empresa titular.
class SubscriptionService {

    static async getByCompanyPublicId(companyPublicId: string): Promise<CompanySubscription> {
        const res = await apiService.get(`/saas/subscription/${companyPublicId}/current-plan`);
        return res.data.data || {};
    }
}

export default SubscriptionService;
