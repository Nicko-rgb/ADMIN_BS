import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { UserAdmin, UserDetail, UpdateUserPayload } from '../interfaces/user.interface';

// Catálogo de usuarios del sistema — listado paginado, con búsqueda y filtros por rol y país.
class UserService {
    static async list(page: number, limit: number, search?: string, role?: string, countryId?: number): Promise<PaginatedResponse<UserAdmin>> {
        const res = await apiService.get('/users', { params: { page, limit, search: search || undefined, role: role || undefined, countryId: countryId || undefined } });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    // Detalle completo de un usuario, para el formulario de edición.
    static async getById(id: number): Promise<UserDetail> {
        const res = await apiService.get(`/users/${id}`);
        return res.data.data;
    }

    // Actualiza los datos de un usuario — todo menos password.
    static async update(id: number, payload: UpdateUserPayload): Promise<{ data: UserDetail; message: string }> {
        const res = await apiService.put(`/users/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default UserService;
