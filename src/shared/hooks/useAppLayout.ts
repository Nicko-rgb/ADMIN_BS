import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { AuthService } from '../../modules/auth/service/authService';
import { getApiErrorStatus, handleApiError } from '../utils/errorHandler';
import toast from '../utils/toast';

/**
 * Estado y handlers propios de AppLayout — logout, colapso del sidebar y
 * tema oscuro — unificados acá porque ningún otro componente los usa.
 *
 * El tema es el ÚNICO controlador de la app: acá viven el estado, la
 * persistencia y la aplicación al DOM. No hay store aparte ni util aparte.
 */

/** Clave de localStorage. Formato simple ("true"/"false") para que el script
 *  inline de index.html pueda leerlo antes del primer pintado (ver abajo). */
const THEME_STORAGE_KEY = 'admin-theme';

/** Doble requestAnimationFrame: el primero espera al layout, el segundo al pintado. */
const afterPaint = (callback: () => void): void => {
    requestAnimationFrame(() => requestAnimationFrame(callback));
};

/** Contador de swaps — si se cambia el tema dos veces seguido, solo el último
 *  swap libera el bloqueo (el rAF del anterior no debe destrabar a medio cambio). */
let swapId = 0;

const readPersistedTheme = (): boolean => {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
    } catch {
        return false; // localStorage bloqueado (modo privado) — tema claro por defecto
    }
};

const persistTheme = (isDark: boolean): void => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, String(isDark));
    } catch {
        // Sin persistencia disponible — el tema igual funciona en esta sesión
    }
};

/**
 * Aplica el tema al DOM sin animar el color de cada elemento.
 *
 * Al cambiar `data-theme`, TODOS los elementos que usan un token de color
 * recalculan su valor de golpe: con `transition` activa, cada uno interpola su
 * color por separado y el cambio se ve como un barrido lento y parpadeante (el
 * secondary del Button es el peor caso: #e8e8e8 → #141414 pasa por el gris
 * medio). El truco es congelar las transiciones durante el swap: se agrega la
 * clase `theme-switching` (ver global.css), se cambia el atributo, y recién
 * después del primer pintado se libera el bloqueo.
 */
const applyTheme = (isDark: boolean): void => {
    const root = document.documentElement;
    const id = ++swapId;

    // 1. Congelar transiciones — tiene que estar activo ANTES de cambiar el atributo.
    root.classList.add('theme-switching');

    // 2. El swap real del tema.
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // 3. Liberar el bloqueo recién cuando el navegador ya pintó los colores nuevos.
    afterPaint(() => {
        if (id === swapId) root.classList.remove('theme-switching');
    });
};

export const useAppLayout = () => {
    const navigate = useNavigate();
    const clearSession = useSessionStore((state) => state.clearSession);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDark, setIsDark] = useState<boolean>(readPersistedTheme);

    // Sincroniza el tema con data-theme en <html> — colors.css ya define
    // [data-theme="dark"]. applyTheme() congela las transiciones durante el
    // swap para que el cambio no se vea como un barrido lento de colores.
    useEffect(() => {
        applyTheme(isDark);
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => {
            const next = !prev;
            persistTheme(next);
            return next;
        });
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            clearSession();
            navigate('/auth/login');
        } catch (error) {
            if (getApiErrorStatus(error) === 401) {
                clearSession();
                navigate('/auth/login');
                return;
            }
            toast.error(`No se pudo cerrar la sesión: ${handleApiError(error)}`);
        }
    };

    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return { logout, isCollapsed, toggleSidebar, isDark, toggleTheme };
};
