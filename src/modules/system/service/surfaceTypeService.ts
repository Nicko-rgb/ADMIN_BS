import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { SurfaceType } from '../../../shared/interfaces/catalog.interface';
import type { CreateSurfaceTypePayload, UpdateSurfaceTypePayload } from '../interfaces/catalog.interface';

// Catálogo de tipos de superficie — un método por endpoint.
class SurfaceTypeService {
    static async list(page: number, limit: number): Promise<PaginatedResponse<SurfaceType>> {
        const res = await apiService.get('/system/surface-types', { params: { page, limit } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Catálogo de tipos de superficie activos: CatalogActiveService.listSurfaceTypes() (shared/service).

    static async create(payload: CreateSurfaceTypePayload): Promise<{ data: SurfaceType; message: string }> {
        const res = await apiService.post('/system/surface-types', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdateSurfaceTypePayload): Promise<{ data: SurfaceType; message: string }> {
        const res = await apiService.put(`/system/surface-types/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/surface-types/${id}`);
        return { message: res.data.message };
    }
}

export default SurfaceTypeService;