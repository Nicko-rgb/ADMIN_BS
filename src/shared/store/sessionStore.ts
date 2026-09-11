import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionUser } from '../interfaces/session.interface';

interface SessionData {
    token: string | null;
    user: SessionUser | null;
    permissions: string[];
    companyIds: number[];
}

interface SessionState extends SessionData {
    setSession: (session: { token: string; user: SessionUser; permissions: string[]; companyIds: number[] }) => void;
    updateUser: (fields: Partial<SessionUser>) => void;
    clearSession: () => void;
}

const EMPTY_SESSION: SessionData = { token: null, user: null, permissions: [], companyIds: [] };

/**
 * Sesión del usuario autenticado — única fuente de verdad del token, del
 * usuario, sus permisos y sus company_ids en el front. Persiste en
 * localStorage para sobrevivir un refresh. `apiService` lee `token` de acá
 * para el header Authorization; `usePermission` lee `permissions`.
 */
export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            ...EMPTY_SESSION,
            setSession: (session) => set(session),
            // Autoedición de perfil (Profile.tsx) — refresca los datos cacheados de la sesión sin
            // pedir un login nuevo (ej. el nombre que muestra el saludo de Home).
            updateUser: (fields) => set((state) => (state.user ? { user: { ...state.user, ...fields } } : state)),
            clearSession: () => set(EMPTY_SESSION),
        }),
        { name: 'admin-session' }
    )
);
