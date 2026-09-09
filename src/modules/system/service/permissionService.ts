import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { CreatePermissionPayload, PermissionAdmin, UpdatePermissionPayload } from '../interfaces/permission.interface';

// Catálogo de permisos del sistema. Sin `search`, list() pagina; con `search`, el backend busca
// por key/label y devuelve todos los resultados sin paginar.
class PermissionService {
    static async list(page: number, limit: number, search?: string, module?: string): Promise<PaginatedResponse<PermissionAdmin>> {
        const res = await apiService.get('/system/permissions', { params: { page, limit, search: search || undefined, module: module || undefined } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Módulos distintos del catálogo — para poblar el filtro por módulo.
    static async listModules(): Promise<string[]> {
        const res = await apiService.get('/system/permissions/modules');
        return res.data.data;
    }

    // Catálogo completo, sin paginar — para pickers de checkboxes (ej. asignar permisos a un usuario).
    static async listCatalog(): Promise<PermissionAdmin[]> {
        const res = await apiService.get('/system/permissions/catalog');
        return res.data.data;
    }

    static async create(payload: CreatePermissionPayload): Promise<{ data: PermissionAdmin; message: string }> {
        const res = await apiService.post('/system/permissions', payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(id: number, payload: UpdatePermissionPayload): Promise<{ data: PermissionAdmin; message: string }> {
        const res = await apiService.put(`/system/permissions/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async delete(id: number): Promise<{ message: string }> {
        const res = await apiService.delete(`/system/permissions/${id}`);
        return { message: res.data.message };
    }
}

export default PermissionService;
