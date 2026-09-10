import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { handleApiError } from '../../../shared/utils/errorHandler';
import CompanyService from '../service/companyService';
import type { CompanyDetail } from '../interfaces/company.interface';

export type CompanyErrorStatus = 'not_found' | 'forbidden' | 'unknown';

// Detalle de una empresa — trae el tenantId de la URL (/companys/company/:tenantId) y carga
// país, ubigeo formateado, dueño y sucursales en un solo fetch. El 404 (tenantId inexistente)
// y el 403 (empresa fuera del scope del usuario, ver company.service.ts::getByTenantId en el
// backend) se distinguen por status para que la página elija entre NotFoundScreen y
// ForbiddenScreen — cualquier otro error queda como 'unknown', mismo mensaje genérico.
export const useCompany = () => {
    const { tenantId } = useParams<{ tenantId: string }>();

    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<CompanyErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchCompany = useCallback(async (id: string) => {
        setIsLoading(true);
        setErrorStatus(null);
        try {
            const data = await CompanyService.getByTenantId(id);
            setCompany(data);
        } catch (err) {
            const status = isAxiosError(err) ? err.response?.status : undefined;
            setErrorStatus(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
            setErrorMessage(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tenantId) fetchCompany(tenantId);
    }, [tenantId, fetchCompany]);

    const retry = () => tenantId && fetchCompany(tenantId);

    return { company, isLoading, errorStatus, errorMessage, retry };
};

export default useCompany;
