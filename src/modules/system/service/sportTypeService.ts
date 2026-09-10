import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CreateSportTypePayload, SportType, UpdateSportTypePayload } from '../interfaces/catalog.interface';

// Catálogo de tipos de deporte — un método por endpoint.
class SportTypeService {
    static async list(page: number, limit: number): Promise<PaginatedResponse<SportType>> {
        const res = await apiService.get('/system/sport-types', { params: { page, limit } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Catálogo de tipos de deporte activos: CatalogActiveService.listSportTypes() (shared/service).

    static async create(payload: CreateSportTypePayload): Promise<{ data: SportType; message: string }> {
        const res = await apiService.post('/system/sport-types', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdateSportTypePayload): Promise<{ data: SportType; message: string }> {
        const res = await apiService.put(`/system/sport-types/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/sport-types/${id}`);
        return { message: res.data.message };
    }
}

export default SportTypeService;