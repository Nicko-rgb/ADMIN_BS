import { isAxiosError } from 'axios';

interface ApiErrorObject {
    code: string;
    message: string;
    details: unknown;
}

interface ApiErrorPayload {
    success: false;
    // La mayoría de los errores pasan por ApiResponse.error (objeto), pero
    // algo que no pase por ahí (ej. express-rate-limit) puede mandar un
    // string plano — cubrir ambos para no terminar con un toast vacío.
    error: ApiErrorObject | string;
}

/**
 * Maneja errores de axios y devuelve un mensaje amigable para el usuario.
 * Cubre los 3 casos posibles de un error de axios: el servidor respondió
 * con un error, el request se hizo pero no hubo respuesta (servidor caído,
 * sin red), o el error ocurrió antes de llegar a mandar el request.
 */
export const handleApiError = (err: unknown): string => {
    if (isAxiosError<ApiErrorPayload>(err)) {
        const serverError = err.response?.data?.error;

        if (serverError && typeof serverError === 'object') {
            // VALIDATION_ERROR trae el detalle real (mensajes de Joi, incluidos
            // los custom con .messages()) en `details` — se muestra solo el primero.
            if (Array.isArray(serverError.details) && serverError.details.length > 0 && typeof serverError.details[0] === 'string') {
                return serverError.details[0];
            }
            if (serverError.message) return serverError.message;
        }

        if (typeof serverError === 'string' && serverError) {
            return serverError;
        }

        if (err.request) {
            return 'No se pudo conectar con el servidor. Inténtelo más tarde.';
        }

        return err.message || 'Error inesperado.';
    }

    return err instanceof Error ? err.message : 'Error inesperado.';
};
