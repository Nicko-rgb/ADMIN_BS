import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type { UserAdmin, UserDetail, UpdateUserPayload, UpdateOwnProfilePayload } from '../interfaces/user.interface';

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

    // Detalle del propio perfil, para precargar la página de autoedición.
    static async getOwnProfile(): Promise<UserDetail> {
        const res = await apiService.get('/users/me');
        return res.data.data;
    }

    // Autoedición del propio perfil — sin role ni is_enabled.
    static async updateOwnProfile(payload: UpdateOwnProfilePayload): Promise<{ data: UserDetail; message: string }> {
        const res = await apiService.put('/users/me', payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default UserService;
