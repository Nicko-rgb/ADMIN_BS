// Formulario de alta/edición de espacio deportivo — espeja space.schema.ts del backend
// (mismos nombres snake_case que espera el endpoint).
import type { EntityStatus } from './sucursal.interface';

export interface SpaceFormValues {
    name: string;
    surface_type_id: number;
    sport_type_id: number;
    sport_category_id: number;
    capacity: number | null;
    dimensions: string;
    equipment: string;
    minimum_booking_minutes: number;
    maximum_booking_minutes: number;
}

export const EMPTY_SPACE_FORM: SpaceFormValues = {
    name: '',
    surface_type_id: 0,
    sport_type_id: 0,
    sport_category_id: 0,
    capacity: null,
    dimensions: '',
    equipment: '',
    minimum_booking_minutes: 60,
    maximum_booking_minutes: 480,
};

export type SpaceFormMode = 'create' | 'edit';

// Ítem del listado "Mis recursos deportivos" (toSpaceDto del backend).
export interface SpaceListItem {
    publicId: string;
    name: string;
    sport: string | null;
    status: EntityStatus;
}

// Detalle completo de un espacio deportivo — espeja toSpaceDto del backend.
export interface SpaceDetail {
    publicId: string;
    name: string;
    sport: string | null;
    sportTypeId: number;
    surfaceName: string;
    surfaceTypeId: number;
    categoryName: string;
    sportCategoryId: number;
    capacity: number | null;
    dimensions: string;
    equipment: string | null;
    minimumBookingMinutes: number;
    maximumBookingMinutes: number;
    status: EntityStatus;
    createdAt: string;
}

// Archivo multimedia de un espacio — espeja toMediaDto del backend.
export interface SpaceMediaFile {
    publicId: string;
    url: string;
    fileName: string;
    description: string | null;
    type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    category: 'GALLERY' | 'PROFILE' | 'COVER' | 'THUMBNAIL' | 'DOCUMENT';
    isPrimary: boolean;
    medibleType: string;
}

// Horario de operación de un espacio — espeja BusinessHour del backend.
export interface SpaceBusinessHour {
    hourId: number;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
    price: string;
    isClosed: boolean;
}

export type SpaceTab = 'gallery' | 'schedule';