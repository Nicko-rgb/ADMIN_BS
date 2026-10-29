
export interface BussinesHourProps {
    isOpen: boolean;
    onClose: () => void;
    /** Espacio dueño de los horarios — el guardado pega contra su endpoint. */
    spacePublicId: string;
    /** Data actual del espacio, ya cargada por la página (useSpace). */
    businessHours: BusinessHourData[];
    /** Se dispara al guardar, para que la página refresque su copia. */
    onSaved?: () => void;
}

/** Horario de operación de un espacio — espeja toHourDto del backend. */
export interface BusinessHourData {
    hourId: number;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    /** 'HH:mm' en 24 horas. */
    startTime: string;
    /** 'HH:mm' en 24 horas — hasta '24:00' (medianoche fin de día). */
    endTime: string;
    /** DECIMAL(10,2) — el backend lo manda como string. */
    price: string;
    isClosed: boolean;
}

/**
 * Día de la semana — sale de `dayOfWeek` del bloque, que es a su vez el ENUM
 * del backend (day_of_week). Derivado y no re-declarado: una sola lista de días.
 */
export type HourDay = BusinessHourData['dayOfWeek'];

/**
 * Un bloque del guardado de la semana — espeja SCHEDULE_BLOCK de
 * hour.schema.ts (snake_case). `is_closed` viaja con el bloque para que el
 * guardado no reabra lo que los toggles cerraron.
 */
export interface HourFormValues {
    day_of_week: HourDay;
    /** 'HH:mm' en 24 horas (00:00 a 23:59). */
    start_time: string;
    /** 'HH:mm' en 24 horas — admite '24:00' (medianoche fin de día). */
    end_time: string;
    price: number;
    is_closed?: boolean;
}

/** Resultado del toggle por día del backend — { day, isClosed, hours }. */
export interface HourDayStatus {
    day: HourDay;
    isClosed: boolean;
    hours: BusinessHourData[];
}
