import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompanyContextState, SessionData, SessionState } from '../interfaces/session.interface';

const EMPTY_CONTEXT = { companies: [], currentPlan: null, loadedAt: '', userPublicId: '' };

/**
 * Árbol empresa → sucursales → espacios recibido en el login.
 * Se conserva en localStorage durante la sesión y se limpia al cerrarla.
 * Es una instantánea para la UI; `access` nunca autoriza operaciones en el backend.
 */
export const useCompanyContextStore = create<CompanyContextState>()(
    persist(
        (set) => ({
            ...EMPTY_CONTEXT,
            setContext: (userPublicId, context) => set({
                companies: context.companies,
                currentPlan: context.currentPlan,
                loadedAt: context.loadedAt,
                userPublicId,
            }),
            clearContext: () => set(EMPTY_CONTEXT),
        }),
        {
            name: 'admin-context',
            version: 3,
            migrate: () => EMPTY_CONTEXT,
            partialize: ({ companies, currentPlan, loadedAt, userPublicId }) => ({ companies, currentPlan, loadedAt, userPublicId }),
        }
    )
);

const EMPTY_SESSION: SessionData = { token: null, user: null, permissions: [], scopeLevel: null };

// Lista explícita de campos persistidos: descarta datos del contrato anterior.
const pickSessionData = (session: Partial<SessionData> | null | undefined): SessionData => ({
    token: session?.token ?? null,
    user: session?.user ?? null,
    permissions: session?.permissions ?? [],
    scopeLevel: session?.scopeLevel ?? null,
});

/**
 * Sesión del usuario autenticado — única fuente de verdad del token, del
 * usuario, sus permisos y su nivel de alcance en el front. Persiste en
 * localStorage para sobrevivir un refresh. `apiService` lee `token` de acá
 * para el header Authorization; `usePermission` lee `permissions`.
 */
export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            ...EMPTY_SESSION,
            setSession: ({ token, user, permissions, scopeLevel, context }) => {
                // No mezclar el árbol con admin-session ni conservar datos del login anterior.
                useCompanyContextStore.getState().clearContext();
                if (!context || !Array.isArray(context.companies)) {
                    set(EMPTY_SESSION);
                    throw new Error('No se pudo cargar el contexto de la sesión. Vuelve a iniciar sesión.');
                }
                useCompanyContextStore.getState().setContext(user.publicId, context);
                set({ token, user, permissions, scopeLevel });
            },
            // Autoedición de perfil (Profile.tsx) — refresca los datos cacheados de la sesión sin
            // pedir un login nuevo (ej. el nombre que muestra el saludo de Home).
            updateUser: (fields) => set((state) => (state.user ? { user: { ...state.user, ...fields } } : state)),
            clearSession: () => {
                useCompanyContextStore.getState().clearContext();
                set(EMPTY_SESSION);
            },
        }),
        {
            name: 'admin-session',
            version: 1,
            migrate: (persisted) => pickSessionData(persisted as Partial<SessionData> | null),
            partialize: (state) => pickSessionData(state),
        }
    )
);

// localStorage se hidrata de forma síncrona. Una sesión sin su contexto requiere login.
const restoredSession = useSessionStore.getState();
const restoredContext = useCompanyContextStore.getState();
if (
    !restoredSession.token
    || !restoredSession.user
    || restoredContext.userPublicId !== restoredSession.user.publicId
    || !restoredContext.loadedAt
    || !Array.isArray(restoredContext.companies)
) {
    useSessionStore.getState().clearSession();
}
