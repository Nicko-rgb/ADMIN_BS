import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { handleApiError, getApiErrorStatus } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import SucursalService from '../service/sucursalService';
import SucursalConfigService from '../service/sucursalConfigService';
import SpaceService from '../service/spaceService';
import type { BannerFile } from '../service/sucursalService';
import type { SpaceListItem } from '../interfaces/space.interface';
import type { SucursalDetail, EntityStatus } from '../interfaces/sucursal.interface';
import type { SucursalConfig } from '../interfaces/sucursalConfig.interface';

export type SucursalErrorStatus = 'not_found' | 'forbidden' | 'unknown';

export const useSucursal = () => {
    const { publicId } = useParams<{ publicId: string }>();

    const [sucursal, setSucursal] = useState<SucursalDetail | null>(null);
    // Config para mostrar en la página (redes en el cover, operativo en su card).
    // null = sin config o no se pudo cargar — la página igual se muestra; el modal
    // hace su propio fetch con manejo de errores al abrirse.
    const [config, setConfig] = useState<SucursalConfig | null>(null);
    const [banner, setBanner] = useState<BannerFile | null>(null);
    const [spaces, setSpaces] = useState<SpaceListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<SucursalErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadToken, setReloadToken] = useState(0);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    useEffect(() => {
        if (!publicId) return;
        let active = true;

        const fetchSucursal = async () => {
            setIsLoading(true);
            setErrorStatus(null);
            setConfig(null);
            try {
                const [sucursalData, configData, bannerData, spacesData] = await Promise.all([
                    SucursalService.getByPublicId(publicId),
                    SucursalConfigService.get(publicId).catch(() => null),
                    SucursalService.getBanner(publicId).catch(() => null),
                    SpaceService.listBySucursal(publicId).catch(() => []),
                ]);
                if (!active) return;
                setSucursal(sucursalData);
                setConfig(configData);
                setBanner(bannerData);
                setSpaces(spacesData);
            } catch (err) {
                if (!active) return;
                const status = getApiErrorStatus(err);
                setErrorStatus(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
                setErrorMessage(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchSucursal();

        return () => { active = false; };
    }, [publicId, reloadToken]);

    const reload = () => setReloadToken((token) => token + 1);

    // Recarga solo la portada (tras subir/eliminar desde el modal).
    const reloadBanner = async () => {
        if (!publicId) return;
        const data = await SucursalService.getBanner(publicId).catch(() => null);
        setBanner(data);
    };

    // Recarga solo los espacios (tras registrar uno nuevo).
    const reloadSpaces = async () => {
        if (!publicId) return;
        const data = await SpaceService.listBySucursal(publicId).catch(() => []);
        setSpaces(data);
    };

    // Cambia el estado de la sucursal (switch de estado) — el backend devuelve la
    // sucursal actualizada, se aplica directo al estado sin recargar la página.
    const handleToggleStatus = async (status: EntityStatus) => {
        if (!publicId) return;
        setIsTogglingStatus(true);
        toast.loading('Actualizando...')
        try {
            const { data, message } = await SucursalService.toggleStatus(publicId)(status);
            toast.success(message);
            setSucursal(data);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsTogglingStatus(false);
        }
    };

    return {
        publicId, sucursal, config, banner, spaces, isLoading, errorStatus, errorMessage,
        retry: reload, reloadBanner, reloadSpaces,
        isTogglingStatus, handleToggleStatus,
    };
};

export default useSucursal;
