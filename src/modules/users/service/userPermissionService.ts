import { apiService } from '../../../shared/utils/apiService';

// Permisos directos de un usuario — reemplazo completo del set (el picker manda siempre el estado final).
class UserPermissionService {
    static async getByUserId(userId: number): Promise<string[]> {
        const res = await apiService.get(`/users/${userId}/permissions`);
        return res.data.data;
    }

    static async update(userId: number, permissionKeys: string[]): Promise<{ data: string[]; message: string }> {
        const res = await apiService.put(`/users/${userId}/permissions`, { permission_keys: permissionKeys });
        return { data: res.data.data, message: res.data.message };
    }
}

export default UserPermissionService;
