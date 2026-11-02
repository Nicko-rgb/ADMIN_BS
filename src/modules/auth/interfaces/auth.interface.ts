export interface LoginAdminPayload {
    email: string;
    password: string;
}

export interface PasswordRequestPayload {
    email: string;
}

export interface PasswordRequestResponse {
    expiresInMinutes: number;
}

export interface PasswordResetPayload {
    token: string;
    password: string;
}
