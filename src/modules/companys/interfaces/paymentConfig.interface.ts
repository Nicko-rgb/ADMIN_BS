import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import type { CompanySubsidiary } from './company.interface';

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

/**
 * Sucursal tal como la pinta el árbol: los datos del DTO de branches más el
 * país ya resuelto (nombre + bandera) desde el catálogo activo.
 */
export interface PaymentConfigBranch extends CompanySubsidiary {
    countryName: string | null;
    countryFlagUrl: string | null;
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
