// Formulario de alta/edición de espacio deportivo — espeja space.schema.ts del backend
// (mismos nombres snake_case que espera el endpoint).
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
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}
