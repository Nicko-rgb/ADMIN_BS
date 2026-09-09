import { apiService } from '../../../shared/utils/apiService';
import type { Plan, UpdatePlanPayload } from '../interfaces/catalog.interface';

// Catálogo de planes SaaS — un método por endpoint.
class PlanService {
    // Todos los planes (activos e inactivos), sin paginar — catálogo chico.
    static async list(): Promise<Plan[]> {
        const res = await apiService.get('/system/plans');
        return res.data.data;
    }

    // Solo activos, sin paginar — endpoint público, para selects/lógica de negocio en toda la app.
    static async listActive(): Promise<Plan[]> {
        const res = await apiService.get('/system/plans/active');
        return res.data.data;
    }

    static async update(id: number, payload: UpdatePlanPayload): Promise<{ data: Plan; message: string }> {
        const res = await apiService.put(`/system/plans/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/plans/${id}`);
        return { message: res.data.message };
    }
}

export default PlanService;
