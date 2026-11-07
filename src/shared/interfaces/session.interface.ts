// Usuario autenticado tal como lo devuelve el login — forma mínima que necesita el front.
// `publicId` es el UUID público (nunca la PK numérica interna — el backend no la expone).
export interface SessionUser {
    publicId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: string;
}

export interface ContextCountry {
    id: number;
    name: string;
    isoCode: string;
}

export interface ContextCurrency {
    code: string;
    name: string;
    symbol: string;
}

export interface ContextSpace {
    publicId: string;
    name: string;
    /** Alcance heredado de la sucursal; no sustituye los permisos de acciones. */
    access: boolean;
}

export interface ContextSucursal {
    publicId: string;
    name: string;
    access: boolean;
    country: ContextCountry | null;
    currency: ContextCurrency | null;
    spaces: ContextSpace[];
}

export interface ContextCompany {
    isPrimary: boolean;
    publicId: string;
    name: string;
    /** Alcance de la empresa; las acciones también requieren sus permisos. */
    access: boolean;
    country: ContextCountry | null;
    sucursales: ContextSucursal[];
}

export interface CompanyContextData {
    companies: ContextCompany[];
}

export interface CompanyContextState extends CompanyContextData {
    userPublicId: string | null;
    loadedAt: string | null;
    setContext: (userPublicId: string, context: CompanyContextData) => void;
    clearContext: () => void;
}

export interface SessionData {
    token: string | null;
    user: SessionUser | null;
    permissions: string[];
    /** Alcance del rol (1=system … 4=empleado, null=cliente) — pista de UI, la seguridad la decide el backend. */
    scopeLevel: number | null;
}

export interface SessionInput extends SessionData {
    token: string;
    user: SessionUser;
    context: CompanyContextData;
}

export interface SessionState extends SessionData {
    setSession: (session: SessionInput) => void;
    updateUser: (fields: Partial<SessionUser>) => void;
    clearSession: () => void;
}
