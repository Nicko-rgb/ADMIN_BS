import type { MedibleImageFile } from '../../../shared/components/MedibleImage';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';

/**
 * Estado de carga de cada bloque de Configuración de pagos.
 * `idle` = todavía no se pidió nada (ej. no hay sucursal seleccionada).
 */
export type PaymentConfigStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Estado de los tipos de pago de la sucursal seleccionada.
 * `no_country` = la sucursal no tiene país, así que no hay catálogo que pedir.
 */
export type PaymentTypesStatus = PaymentConfigStatus | 'no_country';

/** Error de la carga principal de la página — mismo criterio que el resto del módulo. */
export type PaymentConfigErrorStatus = 'not_found' | 'forbidden' | 'unknown';

/** Empresa del árbol, con su país ya resuelto desde el catálogo activo. */
export interface PaymentConfigCompany {
    publicId: string;
    name: string;
    country: { name: string; flagUrl: string } | null;
}

/**
 * Sucursal tal como la pinta el árbol: los nodos del contexto de empresa
 * (`/companys/public/branches/:entityPublicId/tree`) con su país ya resuelto
 * (nombre + bandera) desde el catálogo activo. Solo llegan sucursales con
 * `access: true`.
 */
export interface PaymentConfigBranch {
    publicId: string;
    name: string;
    address: string | null;
    countryId: number | null;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | null;
    countryName: string | null;
    countryFlagUrl: string | null;
    /** Mercado Pago solo opera en Perú; el resto de sucursales no lo ofrece. */
    supportsMercadoPago: boolean;
}

/** Tipo de pago habilitado para el país de la sucursal (propios del país + globales). */
export type PaymentConfigPaymentType = PaymentType;

/** Ambiente de la cuenta de Mercado Pago conectada. */
export type MercadoPagoEnvironment = 'SANDBOX' | 'PRODUCTION';

/** Campos del formulario de registro — todo string, como los maneja el input. */
export interface MercadoPagoFormValues {
    access_token: string;
    public_key: string;
    environment: MercadoPagoEnvironment;
}

/** Payload del registro. El access token viaja en claro y se encripta en el backend. */
export interface RegisterMercadoPagoPayload {
    access_token: string;
    public_key: string | null;
    environment: MercadoPagoEnvironment;
}

export interface ManualPaymentAccountFormValues {
    account_alias: string;
    account_name: string;
    account_number: string;
    bank_name: string;
}

export interface ManualPaymentAccount {
    paymentTypeId: number;
    account_alias: string | null;
    account_name: string | null;
    account_number: string | null;
    qr_url: string | null;
    qr: MedibleImageFile | null;
    bank_name: string | null;
    isActive: boolean;
}
