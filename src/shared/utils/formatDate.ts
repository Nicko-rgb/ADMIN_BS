/* ── Formateo ─────────────────────────────────────────────────────────────── */

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

// Formatea una fecha a 'mes año' con inicial mayúscula (es-ES) — 'Noviembre 2026'.
export const formatMonthYear = (date: Date): string => {
    const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
};

// Formatea una fecha a día y mes corto (es-ES) — '6 nov'.
export const formatShortDate = (date: Date): string =>
    date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

// Formatea una fecha a texto largo (es-ES) — 'viernes, 6 de noviembre de 2026'.
export const formatLongDate = (date: Date): string =>
    date.toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });


    
/* ── Cálculo ──────────────────────────────────────────────────────────────── */

export const startOfDay = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number): Date => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

export const addMonths = (date: Date, months: number): Date =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);

/** Lunes como primer día de la semana. */
export const startOfWeek = (date: Date): Date => {
    const base = startOfDay(date);
    return addDays(base, -((base.getDay() + 6) % 7));
};

export const startOfMonth = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), 1);

/** Clave estable de la fecha en formato `YYYY-MM-DD`. */
export const dateKey = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};
