// Formatea una fecha ISO del backend a texto legible (es-ES) — '—' si no hay valor.
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-ES');
};
