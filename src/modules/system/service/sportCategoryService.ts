import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CreateSportCategoryPayload, SportCategory, UpdateSportCategoryPayload } from '../interfaces/catalog.interface';

// Catálogo de categorías deportivas — un método por endpoint.
class SportCategoryService {
    static async list(page: number, limit: number): Promise<PaginatedResponse<SportCategory>> {
        const res = await apiService.get('/system/sport-categories', { params: { page, limit } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Sin paginar — endpoint público, para selects/lógica de negocio en toda la app (el modelo no tiene is_active).
    static async listActive(): Promise<SportCategory[]> {
        const res = await apiService.get('/system/sport-categories/active');
        return res.data.data;
    }

    static async create(payload: CreateSportCategoryPayload): Promise<{ data: SportCategory; message: string }> {
        const res = await apiService.post('/system/sport-categories', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdateSportCategoryPayload): Promise<{ data: SportCategory; message: string }> {
        const res = await apiService.put(`/system/sport-categories/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/sport-categories/${id}`);
        return { message: res.data.message };
    }
}

export default SportCategoryService;