/**
 * Formatea la comisión informativa de un tipo de pago: `3.99% + S/ 1.00`.
 *
 * El porcentaje se guarda como fracción ('0.0399' → 3.99%) y la comisión fija
 * está expresada en la moneda del país del tipo (por eso recibe el símbolo).
 * Devuelve `null` cuando no hay comisión (null, vacío o cero), para que el
 * llamador decida qué mostrar (ej. un guion).
 */
export const formatPaymentCommission = (
    percentage: string | null,
    fixed: string | null,
    currencySimbol: string | null = null,
): string | null => {
    const percent = percentage && Number(percentage) > 0
        ? `${(Number(percentage) * 100).toFixed(2)}%`
        : null;

    // `Number('')` y `Number(null)` dan 0: se descartan antes de llegar acá.
    const fixedAmount = fixed && Number(fixed) > 0
        ? `${currencySimbol ? `${currencySimbol} ` : ''}${Number(fixed).toFixed(2)}`
        : null;

    if (!percent && !fixedAmount) return null;
    return [percent, fixedAmount].filter(Boolean).join(' + ');
};
