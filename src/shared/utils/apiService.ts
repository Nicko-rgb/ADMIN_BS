import axios from 'axios';
import { useSessionStore } from '../store/sessionStore';

/**
 * Única instancia de axios de toda la app — ningún service llama a axios
 * directo, todos pasan por acá. Base URL relativa (`/api`) en dev pega
 * contra el proxy de Vite (vite.config.ts); en producción, VITE_API_URL
 * apunta directo al backend real.
 */
export const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 15000,
    // Timeout con código propio (ETIMEDOUT) en vez del genérico ECONNABORTED
    transitional: { clarifyTimeoutError: true },
});

// Adjunta el Bearer token de la sesión activa a cada request saliente.
apiService.interceptors.request.use((config) => {
    const token = useSessionStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Sesión inválida (401) en cualquier request autenticado — token expirado, inválido o sesión
 * cerrada en otro lado (blacklist). Limpia la sesión y fuerza un reload duro a login: no se
 * usa `navigate()` de react-router porque este interceptor corre fuera del árbol de React, y
 * el reload de paso descarta cualquier estado en memoria que dependa del usuario ya inexistente.
 * Excluye el propio POST de login — ahí un 401 es "contraseña incorrecta", no una sesión que
 * expiró, y lo maneja el formulario de login con su propio mensaje.
 */
apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            useSessionStore.getState().clearSession();
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default apiService;
