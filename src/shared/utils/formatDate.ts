// Formatea una fecha ISO del backend a texto legible (es-ES) — '—' si no hay valor.
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-ES');
};

// Funcion para formatear una fecha ISO a texto legible (es-ES) — '—' si no hay valor.
export const formatDateText = (dateString: string | null | undefined): string => {
    if (!dateString) return 'No registrado';
    const parsed = new Date(dateString.length === 10 ? `${dateString}T12:00:00` : dateString);
    return Number.isNaN(parsed.getTime()) ? 'No registrado' : new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed);
};