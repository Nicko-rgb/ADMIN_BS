import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { handleApiError, getApiErrorStatus } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import SpaceService from '../service/spaceService';
import BusinessHourService from '../service/bussinesHourService';
import type { SpaceDetail, SpaceMediaFile, SpaceTab } from '../interfaces/space.interface';
import type { BusinessHourData } from '../interfaces/bussinesHour.interfece';
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

const formatTime = (time: string) => time.slice(0, 5);

export const useSpace = () => {
    const { spacePublicId } = useParams<{ spacePublicId: string }>();

    const [space, setSpace] = useState<SpaceDetail | null>(null);
    const [media, setMedia] = useState<SpaceMediaFile[]>([]);
    const [businessHours, setBusinessHours] = useState<BusinessHourData[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [mLoading, setMLoading] = useState(false);
    const [hLoading, setHLoading] = useState(false);

    const [errorStatus, setErrorStatus] = useState<SpaceErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    const [activeTab, setActiveTab] = useState<SpaceTab>('gallery');
    const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);

    const [mediaToDelete, setMediaToDelete] = useState<SpaceMediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [hoursLoaded, setHoursLoaded] = useState(false);

    const reload = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    const fetchSpace = useCallback(async () => {
        if (!spacePublicId) { setIsLoading(false); return; }

        setIsLoading(true);
        setErrorStatus(null);
        setErrorMessage('');

        try {
            const data = await SpaceService.spaceById(spacePublicId);
            setSpace(data.data);
            toast.success(data.message)
        } catch (err) {
            const status = getApiErrorStatus(err);
            setErrorStatus( status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown', );
            setErrorMessage(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, [spacePublicId]);

    const reloadMedia = useCallback(async () => {
        if (!spacePublicId) return;

        setMLoading(true);

        try {
            const response = await SpaceService.getMedia(spacePublicId);
            setMedia(response);
            setMediaLoaded(true);
        } catch (err) {
            setMedia([]);
            setMediaLoaded(false);
            toast.error(handleApiError(err));
        } finally {
            setMLoading(false);
        }
    }, [spacePublicId]);

    const reloadHours = useCallback(async () => {
        if (!spacePublicId) return;

        setHLoading(true);

        try {
            const hours = await BusinessHourService.list(spacePublicId);
            setBusinessHours(hours);
            setHoursLoaded(true);
        } catch (err) {
            setBusinessHours([]);
            setHoursLoaded(false);
            toast.error(handleApiError(err));
        } finally {
            setHLoading(false);
        }
    }, [spacePublicId]);

    useEffect(() => {
        fetchSpace();
    }, [fetchSpace, reloadToken]);

    useEffect(() => {
        if (activeTab !== 'gallery' || mediaLoaded) return;
        reloadMedia();
    }, [activeTab, mediaLoaded, reloadMedia, reloadToken]);

    useEffect(() => {
        if (activeTab !== 'schedule' || hoursLoaded) return;
        reloadHours();
    }, [activeTab, hoursLoaded, reloadHours, reloadToken]);

    const handleTabChange = useCallback((tab: SpaceTab) => {
        setActiveTab(tab);
    }, []);

    const openPanelModal = useCallback(() => {
        setIsPanelModalOpen(true);
    }, []);

    const closePanelModal = useCallback(() => {
        setIsPanelModalOpen(false);
    }, []);

    const handleDeleteMedia = useCallback(async () => {
        if (!mediaToDelete || !spacePublicId || isDeleting) return;

        setIsDeleting(true);

        try {
            const response = await SpaceService
                .removeMedia(spacePublicId)(mediaToDelete.publicId);

            toast.success(response.message);
            setMediaToDelete(null);
            setMediaLoaded(false);
            await reloadMedia();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeleting(false);
        }
    }, [mediaToDelete, spacePublicId, isDeleting, reloadMedia]);

    const handleToggleStatus = useCallback(async (status: EntityStatus) => {
        if (!spacePublicId || isTogglingStatus) return;

        setIsTogglingStatus(true);

        try {
            const { data, message } = await SpaceService
                .toggleStatus(spacePublicId)(status);

            toast.success(message);
            setSpace(data);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsTogglingStatus(false);
        }
    }, [spacePublicId, isTogglingStatus]);

    return {
        spacePublicId,
        space,
        media,
        businessHours,

        isLoading,
        mLoading,
        hLoading,

        errorStatus,
        errorMessage,
        retry: reload,

        reloadMedia,
        reloadHours,

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