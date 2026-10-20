import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { handleApiError, getApiErrorStatus } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import SpaceService from '../service/spaceService';
import type { SpaceDetail, SpaceBusinessHour, SpaceMediaFile, SpaceTab } from '../interfaces/space.interface';
import type { EntityStatus } from '../interfaces/sucursal.interface';

export type SpaceErrorStatus = 'not_found' | 'forbidden' | 'unknown';

const DAY_LABELS = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
} as const;

// const DAY_ORDER: (keyof typeof DAY_LABELS)[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const formatTime = (time: string) => time.slice(0, 5);

export const useSpace = () => {
    const { spacePublicId } = useParams<{ spacePublicId: string }>();

    const [space, setSpace] = useState<SpaceDetail | null>(null);
    const [media, setMedia] = useState<SpaceMediaFile[]>([]);
    // Los horarios todavía no tienen endpoint — siempre vacío por ahora.
    const [businessHours] = useState<SpaceBusinessHour[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<SpaceErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    // Sección activa de la página (Galería / Horarios).
    const [activeTab, setActiveTab] = useState<SpaceTab>('gallery');

    // UN solo estado de apertura para los modales de las secciones. Cuál se
    // muestra lo decide `activeTab`: así el modal de galería y el de horarios
    // comparten la misma apertura y cambiar de pestaña con el modal abierto
    // intercambia su contenido sin gestionar dos flags.
    const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);

    // Archivo de la galería pendiente de eliminar — el Dialog de la página confirma
    // la acción calling handleDeleteMedia.
    const [mediaToDelete, setMediaToDelete] = useState<SpaceMediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // Cambio de estado del espacio en curso (switch de estado).
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    useEffect(() => {
        if (!spacePublicId) return;
        let active = true;

        const fetchSpace = async () => {
            setIsLoading(true);
            setErrorStatus(null);
            try {
                const spaceData = await SpaceService.spaceById(spacePublicId);
                if (!active) return;
                setSpace(spaceData);
            } catch (err) {
                if (!active) return;
                const status = getApiErrorStatus(err);
                setErrorStatus(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
                setErrorMessage(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchSpace();

        return () => { active = false; };
    }, [spacePublicId, reloadToken]);

    // Galería del espacio — carga aparte para que un fallo de media no rompa
    // la página (el detalle del espacio ya se pintó).
    useEffect(() => {
        if (!spacePublicId) return;
        let active = true;

        SpaceService.getMedia(spacePublicId)
            .then((files) => { if (active) setMedia(files); })
            .catch(() => { if (active) setMedia([]); });

        return () => { active = false; };
    }, [spacePublicId, reloadToken]);

    const reload = () => setReloadToken((token) => token + 1);

    const handleTabChange = (tab: SpaceTab) => setActiveTab(tab);

    // Abre el modal de la sección activa.
    const openPanelModal = () => setIsPanelModalOpen(true);

    // Cierra el modal de la sección activa.
    const closePanelModal = () => setIsPanelModalOpen(false);

    // Recarga la galería (tras subir o eliminar un archivo).
    const reloadMedia = async () => {
        if (!spacePublicId) return;
        const files = await SpaceService.getMedia(spacePublicId).catch(() => []);
        setMedia(files);
    };

    // Confirma y ejecuta el borrado del archivo de la galería.
    const handleDeleteMedia = async () => {
        if (!mediaToDelete || !spacePublicId) return;
        setIsDeleting(true);
        try {
            const response = await SpaceService.removeMedia(spacePublicId)(mediaToDelete.publicId);
            toast.success(response.message);
            setMediaToDelete(null);
            reloadMedia();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeleting(false);
        }
    };

    // Cambia el estado del espacio (switch de estado) — el backend devuelve el
    // espacio actualizado, se aplica directo al estado sin recargar la página.
    const handleToggleStatus = async (status: EntityStatus) => {
        if (!spacePublicId) return;
        setIsTogglingStatus(true);
        try {
            const { data, message } = await SpaceService.toggleStatus(spacePublicId)(status);
            toast.success(message);
            setSpace(data);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsTogglingStatus(false);
        }
    };

    return {
        spacePublicId,
        space,
        media,
        businessHours,
        isLoading,
        errorStatus,
        errorMessage,
        retry: reload,
        reloadMedia,
        dayLabels: DAY_LABELS,
        formatTime,
        activeTab,
        handleTabChange,
        isPanelModalOpen,
        openPanelModal,
        closePanelModal,
        mediaToDelete,
        setMediaToDelete,
        isDeleting,
        handleDeleteMedia,
        isTogglingStatus,
        handleToggleStatus,
    };
};

export default useSpace;