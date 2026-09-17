// Mapa de errores por campo de un formulario — un campo sin entrada está correcto.
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export const REQUIRED_MESSAGE = 'Este campo es obligatorio';

// ¿El valor cuenta como completado? Texto no vacío, número mayor a 0, array con elementos.
export const isFilled = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value > 0;
    return value !== null && value !== undefined;
};

// ¿Es una URL http(s) completa? Mismo criterio que el `.uri({ scheme: ['http', 'https'] })` de Joi.
export const isValidUrl = (value: string): boolean => {
    try {
        const { protocol } = new URL(value.trim());
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
};

// Marca con REQUIRED_MESSAGE cada campo obligatorio que esté vacío.
export const requiredErrors = <T extends object>(values: T, fields: (keyof T)[]): FormErrors<T> => {
    const errors: FormErrors<T> = {};
    fields.forEach((field) => {
        if (!isFilled(values[field])) errors[field] = REQUIRED_MESSAGE;
    });
    return errors;
};

export const hasErrors = (errors: object): boolean => Object.keys(errors).length > 0;
