// Recorta espacios al inicio/final de cada valor string de un objeto — red de seguridad antes de enviar
// un payload al backend (ej. submit por Enter, que no dispara el onBlur de InputField/TextAreaField).
export const trimValues = <T extends object>(data: T): T => {
    const result = { ...data };
    (Object.keys(result) as (keyof T)[]).forEach((key) => {
        const value = result[key];
        if (typeof value === 'string') {
            result[key] = value.trim() as T[keyof T];
        }
    });
    return result;
};
