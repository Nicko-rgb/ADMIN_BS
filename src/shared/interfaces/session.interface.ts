// Usuario autenticado tal como lo devuelve el login — forma mínima que necesita el front.
export interface SessionUser {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: string;
}
