import { apiService } from '../../../shared/utils/apiService';
import type { UserDetail, UpdateOwnProfilePayload } from '../interfaces/user.interface';
import type { CompanyUser } from '../../companys/interfaces/company.interface';

// Perfil del usuario autenticado (/users/me). La gestión de otros usuarios vive en manageUserService.
class UserService {
    static async listByCompany(companyPublicId: string): Promise<CompanyUser[]> {
        const res = await apiService.get(`/users/company/${companyPublicId}/users-for-company`);
        return res.data.data;
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
