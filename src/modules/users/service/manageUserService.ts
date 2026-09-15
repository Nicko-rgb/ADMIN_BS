import { apiService } from '../../../shared/utils/apiService';
import type { PaginatedResponse } from '../../../shared/interfaces/pagination.interface';
import type {
    CreateManagedUserPayload, ManagedRole, ManagedUserDetail, UpdateManagedUserPayload, UserAdmin,
} from '../interfaces/user.interface';

// Gestión de usuarios por rol (/users/manage/:role) — el rol de la URL es el del usuario gestionado
// (en edición, su rol actual); el backend valida jerarquía, permiso y alcance.
class ManageUserService {
    // Catálogo global de usuarios, paginado, con búsqueda por nombre o correo y filtros por rol y país.
    static async list(page: number, limit: number, search?: string, role?: string, countryId?: number): Promise<PaginatedResponse<UserAdmin>> {
        const res = await apiService.get('/users/manage', {
            params: { page, limit, search: search || undefined, role: role || undefined, countryId: countryId || undefined },
        });
        return { data: res.data.data, pagination: res.data.pagination };
    }

    static async getById(role: ManagedRole, id: number): Promise<ManagedUserDetail> {
        const res = await apiService.get(`/users/manage/${role}/${id}`);
        return res.data.data;
    }

    static async create(role: ManagedRole, payload: CreateManagedUserPayload): Promise<{ data: ManagedUserDetail; message: string }> {
        const res = await apiService.post(`/users/manage/${role}`, payload);
        return { data: res.data.data, message: res.data.message };
    }

    static async update(role: ManagedRole, id: number, payload: UpdateManagedUserPayload): Promise<{ data: ManagedUserDetail; message: string }> {
        const res = await apiService.put(`/users/manage/${role}/${id}`, payload);
        return { data: res.data.data, message: res.data.message };
    }
}

export default ManageUserService;
