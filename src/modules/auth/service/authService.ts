import { apiService } from '../../../shared/utils/apiService';
import type { LoginAdminPayload, LoginAdminResponse } from '../interfaces/auth.interface';

export class AuthService {
    static async loginAdmin(payload: LoginAdminPayload): Promise<LoginAdminResponse> {
        const res = await apiService.post('/auth/login', payload);
        return res.data.data;
    }
}
