import { apiService } from '../../../shared/utils/apiService';
import type { BusinessHourData, HourDay, HourDayStatus, HourFormValues } from '../interfaces/bussinesHour.interfece';

/**
 * Horarios de operación de un espacio (BusinessHour) — espeja hours.route.ts
 * del backend: listado, guardado de la semana completa y los dos toggles (un
 * bloque suelto y el día entero). Los bloques son semanales (día + rango), no
 * fechas: un bloque de LUNES aplica a todos los lunes. Los tipos viven en
 * bussinesHour.interfece.ts.
 */

class BusinessHourService {
    /** Bloques de horario del espacio — lista completa (el front los agrupa por día). */
    static async list(spacePublicId: string): Promise<BusinessHourData[]> {
        const res = await apiService.get(`/hours/space/${spacePublicId}/list`);
        return res.data.data ?? [];
    }

    /** Guarda la semana completa */
    static async save(spacePublicId: string, hours: HourFormValues[]): Promise<{ data: BusinessHourData[]; message: string }> {
        const res = await apiService.put(`/hours/space/${spacePublicId}`, { hours });
        return { data: res.data.data, message: res.data.message };
    }

    /** Habilita/deshabilita UN bloque (is_closed) — los demás bloques del día siguen operando. */
    static async toggleClosed(spacePublicId: string, hourId: number): Promise<{ data: BusinessHourData; message: string }> {
        const res = await apiService.patch(`/hours/space/${spacePublicId}/${hourId}/close`);
        return { data: res.data.data, message: res.data.message };
    }

    /** Habilita/deshabilita el DÍA entero — invierte is_closed en todos sus bloques. */
    static async toggleDayClosed(spacePublicId: string, day: HourDay): Promise<{ data: HourDayStatus; message: string }> {
        const res = await apiService.patch(`/hours/space/${spacePublicId}/${day}`);
        return { data: res.data.data, message: res.data.message };
    }
}

export default BusinessHourService;
