// Usuario autenticado tal como lo devuelve el login — forma mínima que necesita el front.
// `publicId` es el UUID público (nunca la PK numérica interna — el backend no la expone).
export interface SessionUser {
    publicId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: string;
}
