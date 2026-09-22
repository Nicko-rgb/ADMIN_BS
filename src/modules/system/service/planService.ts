import { apiService } from '../../../shared/utils/apiService';
import type { Plan } from '../../../shared/interfaces/catalog.interface';
import type { UpdatePlanPayload } from '../interfaces/catalog.interface';

// Catálogo de planes SaaS — un método por endpoint.
class PlanService {
    // Todos los planes (activos e inactivos), sin paginar — catálogo chico.
    static async list(): Promise<Plan[]> {
        const res = await apiService.get('/saas/plans');
        return res.data.data;
    }

    // Catálogo de planes activos: CatalogActiveService.listPlans() (shared/service).

    static async update(publicId: string, payload: UpdatePlanPayload): Promise<{ data: Plan; message: string }> {
        const res = await apiService.put(`/saas/plans/${publicId}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(publicId: string): Promise<{ message: string }> {
        const res = await apiService.delete(`/saas/plans/${publicId}`);
        return { message: res.data.message };
    }
}

export default PlanService;
