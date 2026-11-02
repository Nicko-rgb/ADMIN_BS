import { useCompanyContextStore } from '../store/sessionStore';
import toast from './toast';

// Una actualización de contexto fallida no convierte una escritura confirmada en fallida.
export const refreshCompanyContext = async (): Promise<void> => {
    try {
        await useCompanyContextStore.getState().refreshContext();
    } catch {
        toast.error('El cambio se guardó, pero no se pudo actualizar el árbol. Vuelve a iniciar sesión para recargarlo.');
    }
};
