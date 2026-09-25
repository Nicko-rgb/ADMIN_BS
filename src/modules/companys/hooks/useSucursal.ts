import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { handleApiError } from '../../../shared/utils/errorHandler';
import SucursalService from '../service/sucursalService';
import type { SucursalDetail } from '../interfaces/sucursal.interface';

export type SucursalErrorStatus = 'not_found' | 'forbidden' | 'unknown';

// Detalle de una sucursal — trae el publicId de la URL (/companys/company/sucursal/:publicId).
// El 404 (publicId inexistente o no es sucursal) y el 403 (fuera del scope del usuario, ver
// sucursal.service.ts en el backend) se distinguen por status para que la página elija entre
// NotFoundScreen y ForbiddenScreen — cualquier otro error queda como 'unknown'.
export const useSucursal = () => {
    const { publicId } = useParams<{ publicId: string }>();

    const [sucursal, setSucursal] = useState<SucursalDetail | null>(null);
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
            try {
                const data = await SucursalService.getByPublicId(publicId);
                if (active) setSucursal(data);
            } catch (err) {
                if (!active) return;
                const status = isAxiosError(err) ? err.response?.status : undefined;
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

    return { publicId, sucursal, isLoading, errorStatus, errorMessage, retry: reload };
};

export default useSucursal;
