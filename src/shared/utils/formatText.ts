// Rango Unicode "Combining Diacritical Marks" (U+0300-U+036F) construido por
// codigo numerico para evitar caracteres invisibles sueltos en el archivo fuente.
const DIACRITICS = new RegExp('[' + String.fromCharCode(768) + '-' + String.fromCharCode(879) + ']', 'g');

// Normaliza un string quitando tildes/acentos y pasando a minusculas -- permite busquedas insensibles a acentos ("mexico" encuentra "Mexico" con tilde).
export const normalizeStr = (str: unknown): string =>
    String(str ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(DIACRITICS, '');

// Antepone el código de país al número local para mostrar (ej. "+51 999888777") -- el backend
// nunca los concatena, guarda el número local puro y expone el country.phoneCode aparte.
export const formatPhone = (phoneCode: string | null | undefined, phone: string | null | undefined): string => {
    if (!phone) return '';
    return phoneCode ? `${phoneCode} ${phone}` : phone;
};
