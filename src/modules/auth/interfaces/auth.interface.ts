import type { SessionUser } from '../../../shared/interfaces/session.interface';

export interface LoginAdminPayload {
    email: string;
    password: string;
}

export interface LoginAdminResponse {
    token: string;
    user: SessionUser;
    permissions: string[];
    companyIds: number[];
}
