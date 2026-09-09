import hotToast from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';

type ToastOptions = Partial<Pick<Toast, 'duration' | 'position'>>;

// Descarta el/los toasts visibles antes de mostrar uno nuevo — así siempre
// se ve un solo mensaje, pero cada uno entra/sale con su animación normal
// (a diferencia de compartir un mismo id, que actualiza el toast en el
// lugar sin animar el cambio).
const replace = (show: () => string) => {
    hotToast.dismiss();
    return show();
};

/**
 * Wrapper de react-hot-toast — agrega `warning`/`info`, que la librería no
 * trae de fábrica (solo success/error/loading). El estilo es único y global,
 * configurado en <Toaster toastOptions> (App.tsx) — acá solo cambia el
 * ícono según el tipo. Usar siempre este wrapper, nunca react-hot-toast directo.
 */
const toast = {
    success: (message: string, options?: ToastOptions) => replace(() => hotToast.success(message, options)),
    error: (message: string, options?: ToastOptions) => replace(() => hotToast.error(message, options)),
    warning: (message: string, options?: ToastOptions) => replace(() => hotToast(message, { ...options, icon: '⚠️' })),
    info: (message: string, options?: ToastOptions) => replace(() => hotToast(message, { ...options, icon: 'ℹ️' })),
    // El success/error que sigue reemplaza este toast automáticamente (mismo mecanismo de `replace`).
    loading: (message: string, options?: ToastOptions) => replace(() => hotToast.loading(message, options)),
};

export default toast;
