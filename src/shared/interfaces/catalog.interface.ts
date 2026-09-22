export interface Country {
    id: number;
    country: string;
    isoCountry: string;
    phoneCode: string;
    isoCurrency: string;
    currency: string;
    currencySimbol: string;
    timeZone: string;
    language: string;
    dateFormat: string;
    flagUrl: string;
    isActive: boolean;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

// País con su bandera, para mostrar en una celda de tabla (nombre + TableImage).
export interface CountryDisplay {
    name: string;
    flagUrl: string;
    phoneCode: string;
}

export interface SportType {
    id: number;
    code: string;
    name: string;
    isActive: boolean;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SportCategory {
    id: number;
    code: string;
    name: string;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SurfaceType {
    id: number;
    code: string;
    name: string;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentType {
    id: number;
    countryId: number;
    countryName: string | null;
    name: string;
    code: string;
    category: string;
    provider: string | null;
    description: string | null;
    iconUrl: string | null;
    isActive: boolean;
    processingTime: string | null;
    commissionPercentage: string | null;
    fixedCommission: string | null;
    minAmount: string | null;
    maxAmount: string | null;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

// Niveles conocidos hoy por el backend (Joi .valid()) — la columna es STRING libre, no ENUM de DB.
export type PlanNotificationsTier = 'basic' | 'full';

export interface Plan {
    publicId: string;
    name: string;
    code: string;
    priceMonthly: string;
    priceYearly: string;
    maxSubsidiaries: number;
    maxSpaces: number;
    maxUsers: number;
    hasStripeConnect: boolean;
    maxInvoicesMonthly: number;
    notificationsTier: PlanNotificationsTier;
    hasAdvancedReports: boolean;
    allowsMultiCompany: boolean;
    features: string[];
    isActive: boolean;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

// Rol del sistema — 5 roles base sembrados (cliente, empleado, administrador, super_admin, system)
// más los que se creen desde System > Permisos > tab Roles.
export interface RoleAdmin {
    id: number;
    key: string;
    label: string;
    // Alcance de datos: 1=system (todo), 2=super_admin (sus empresas), 3=administrador
    // (sus sucursales), 4=empleado (sus sucursales), null=no aplica (ej. cliente).
    scopeLevel: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Nodo del árbol de ubigeo para selects en cascada — `hasChildren` indica si hay un nivel más para pedir.
export interface UbigeoNode {
    id: number;
    code: string;
    name: string;
    level: number;
    parentId: number | null;
    countryId: number;
    hasChildren: boolean;
}
