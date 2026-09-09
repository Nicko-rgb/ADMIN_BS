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

// Payload de actualización — claves snake_case, iguales a las columnas del modelo (contrato de escritura del backend).
export interface UpdateCountryPayload {
    country?: string;
    iso_country?: string;
    phone_code?: string;
    iso_currency?: string;
    currency?: string;
    currency_simbol?: string;
    time_zone?: string;
    language?: string;
    date_format?: string;
    flag_url?: string;
    is_active?: boolean;
}

// Payload de creación — mismas claves que UpdateCountryPayload, todas requeridas salvo is_active (default true en backend).
export interface CreateCountryPayload {
    country: string;
    iso_country: string;
    phone_code: string;
    iso_currency: string;
    currency: string;
    currency_simbol: string;
    time_zone: string;
    language: string;
    date_format: string;
    flag_url: string;
    is_active: boolean;
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

export interface UpdateSportTypePayload {
    code?: string;
    name?: string;
    is_active?: boolean;
}

// Payload de creación — mismas claves que UpdateSportTypePayload, todas requeridas salvo is_active (default true en backend).
export interface CreateSportTypePayload {
    code: string;
    name: string;
    is_active: boolean;
}

export interface SportCategory {
    id: number;
    code: string;
    name: string;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSportCategoryPayload {
    code?: string;
    name?: string;
}

// Payload de creación — mismas claves que UpdateSportCategoryPayload, todas requeridas.
export interface CreateSportCategoryPayload {
    code: string;
    name: string;
}

export interface SurfaceType {
    id: number;
    code: string;
    name: string;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSurfaceTypePayload {
    code?: string;
    name?: string;
}

// Payload de creación — mismas claves que UpdateSurfaceTypePayload, todas requeridas.
export interface CreateSurfaceTypePayload {
    code: string;
    name: string;
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

export interface UpdatePaymentTypePayload {
    country_id?: number;
    name?: string;
    code?: string;
    category?: string;
    provider?: string | null;
    description?: string | null;
    icon_url?: string | null;
    is_enabled?: boolean;
    processing_time?: string | null;
    commission_percentage?: string | null;
    fixed_commission?: string | null;
    min_amount?: string | null;
    max_amount?: string | null;
}

// Payload de creación — mismas claves que UpdatePaymentTypePayload; requeridas las que el backend exige
// (country_id, name, code, category, is_enabled), el resto opcional/nullable igual que en el modelo.
export interface CreatePaymentTypePayload {
    country_id: number;
    name: string;
    code: string;
    category: string;
    provider: string | null;
    description: string | null;
    icon_url: string | null;
    is_enabled: boolean;
    processing_time: string | null;
    commission_percentage: string | null;
    fixed_commission: string | null;
    min_amount: string | null;
    max_amount: string | null;
}

// Una fila = una hoja (nivel más bajo real) con toda su cadena de padres ya resuelta — sin filas redundantes por nivel intermedio.
// `name` es el nombre propio de la hoja (no un ancestro) — es el único campo editable junto a `code`.
export interface Ubigeo {
    id: number;
    code: string;
    name: string;
    countryId: number;
    countryName: string | null;
    level1: string | null;
    level2: string | null;
    level3: string | null;
    referencesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUbigeoPayload {
    name?: string;
    code?: string;
}

// Payload de creación — un nodo nuevo bajo `parent_id` (hijo directo) o como nivel 1 de `country_id`
// cuando `parent_id` es null. El `level` no se manda: lo calcula el backend a partir del padre.
export interface CreateUbigeoPayload {
    name: string;
    code: string;
    country_id: number;
    parent_id: number | null;
}

// Un nodo del árbol de ubigeo para selects en cascada (endpoint público /ubigeo/active) — sin
// ancestros resueltos, ya que el consumidor los conoce por haber seleccionado cada nivel en orden.
// `hasChildren` indica si conviene pedir el siguiente nivel pasando `id` como parentId.
export interface UbigeoNode {
    id: number;
    code: string;
    name: string;
    level: number;
    parentId: number | null;
    countryId: number;
    hasChildren: boolean;
}

// Niveles conocidos hoy por el backend (Joi .valid()) — la columna es STRING libre, no ENUM de DB,
// así que un nivel nuevo es agregar acá + al Joi, nunca una migración.
export type PlanNotificationsTier = 'basic' | 'automated' | 'full';

export interface Plan {
    id: number;
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

export interface UpdatePlanPayload {
    name?: string;
    code?: string;
    price_monthly?: string;
    price_yearly?: string;
    max_subsidiaries?: number;
    max_spaces?: number;
    max_users?: number;
    has_stripe_connect?: boolean;
    max_invoices_monthly?: number;
    notifications_tier?: PlanNotificationsTier;
    has_advanced_reports?: boolean;
    allows_multi_company?: boolean;
    is_active?: boolean;
    features?: string[];
}
