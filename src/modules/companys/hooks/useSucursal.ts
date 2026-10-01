import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { handleApiError, getApiErrorStatus } from '../../../shared/utils/errorHandler';
import SucursalService from '../service/sucursalService';
import SucursalConfigService from '../service/sucursalConfigService';
import type { SucursalDetail } from '../interfaces/sucursal.interface';
import type { SucursalConfig } from '../interfaces/sucursalConfig.interface';

export type SucursalErrorStatus = 'not_found' | 'forbidden' | 'unknown';

// Detalle de una sucursal — trae el publicId de la URL (/companys/company/sucursal/:publicId).
// El 404 (publicId inexistente o no es sucursal) y el 403 (fuera del scope del usuario, ver
// sucursal.service.ts en el backend) se distinguen por status para que la página elija entre
// NotFoundScreen y ForbiddenScreen — cualquier otro error queda como 'unknown'.
export const useSucursal = () => {
    const { publicId } = useParams<{ publicId: string }>();

    const [sucursal, setSucursal] = useState<SucursalDetail | null>(null);
    // Config para mostrar en la página (redes en el cover, operativo en su card).
    // null = sin config o no se pudo cargar — la página igual se muestra; el modal
    // hace su propio fetch con manejo de errores al abrirse.
    const [config, setConfig] = useState<SucursalConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<SucursalErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        if (!publicId) return;
        let active = true;

        const fetchSucursal = async () => {
            setIsLoading(true);
            setErrorStatus(null);
            setConfig(null);
            try {
                const [sucursalData, configData] = await Promise.all([
                    SucursalService.getByPublicId(publicId),
                    SucursalConfigService.get(publicId).catch(() => null),
                ]);
                if (!active) return;
                setSucursal(sucursalData);
                setConfig(configData);
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

    return { publicId, sucursal, config, isLoading, errorStatus, errorMessage, retry: reload };
};

export default useSucursal;
