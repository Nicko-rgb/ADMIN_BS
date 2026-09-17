import { apiService } from '../../../shared/utils/apiService';
import type { LoginAdminPayload, LoginAdminResponse, PasswordRequestPayload, PasswordRequestResponse, PasswordResetPayload } from '../interfaces/auth.interface';

export class AuthService {

    // Login del panel admin
    static async loginAdmin(payload: LoginAdminPayload): Promise<LoginAdminResponse> {
        const res = await apiService.post('/auth/login', payload);
        return res.data.data;
    }

    // Envía el enlace de recuperación de contraseña (clientes y administrativos)
    static async passwordRequest(payload: PasswordRequestPayload): Promise<{ data: PasswordRequestResponse; message: string }> {
        const res = await apiService.post('/auth/password-request', payload);
        return res.data;
    }

    // Comprueba que el enlace de recuperación siga vigente, sin consumirlo
    static async passwordResetValidateToken(payload: { token: string }): Promise<{ message: string }> {
        const res = await apiService.post('/auth/reset-validate-token', payload);
        return res.data;
    }

    // Consume el enlace de recuperación (un solo uso) y guarda la nueva contraseña
    static async passwordReset(payload: PasswordResetPayload): Promise<{ message: string }> {
        const res = await apiService.post('/auth/password-reset', payload);
        return res.data;
    }
}
