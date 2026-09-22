import { apiService } from '../../../shared/utils/apiService';

// Permisos directos de un usuario — reemplazo completo del set (el picker manda siempre el estado final).
class UserPermissionService {
    static async getByUserId(userPublicId: string): Promise<string[]> {
        const res = await apiService.get(`/users/${userPublicId}/permissions`);
        return res.data.data;
    }

    static async update(userPublicId: string, permissionKeys: string[]): Promise<{ data: string[]; message: string }> {
        const res = await apiService.put(`/users/${userPublicId}/permissions`, { permission_keys: permissionKeys });
        return { data: res.data.data, message: res.data.message };
    }
}

export default UserPermissionService;
