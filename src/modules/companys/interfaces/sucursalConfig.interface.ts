import type { FormErrors } from '../../../shared/utils/formErrors';

// Configuración de una sucursal (toSucursalConfigDto) — perfil operativo + redes.
// `minPrice` viaja como string (DECIMAL de la DB); el form lo edita como input numérico.
// El estado de la sucursal NO va acá: se expone en el detalle de la sucursal
// (sucursal.interface.ts) y se cambia con su propio endpoint.
export interface SucursalConfig {
    publicId: string;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTiktok: string | null;
    socialYoutube: string | null;
    socialWhatsapp: string | null;
    whatsappMessage: string | null;
    openingTime: string | null;
    closingTime: string | null;
    minPrice: string | null;
    features: string | null;
}

// Estado crudo del form — todo string de input. Horarios obligatorios; el resto viaja
// como '' y se convierte a null al armar el payload.
export interface SucursalConfigFormValues {
    social_facebook: string;
    social_instagram: string;
    social_tiktok: string;
    social_youtube: string;
    social_whatsapp: string;
    whatsapp_message: string;
    opening_time: string;
    closing_time: string;
    min_price: string;
    features: string;
}

export type SucursalConfigFormErrors = FormErrors<SucursalConfigFormValues>;

// Payload del upsert — PUT parcial con mínimo 1 campo (ver sucursalConfig.schema en backend).
// Mismo shape para crear y editar: si no hay config se crea, si hay se actualiza.
export interface SucursalConfigPayload {
    social_facebook?: string | null;
    social_instagram?: string | null;
    social_tiktok?: string | null;
    social_youtube?: string | null;
    social_whatsapp?: string | null;
    whatsapp_message?: string | null;
    opening_time?: string | null;
    closing_time?: string | null;
    min_price?: number | null;
    features?: string | null;
}
