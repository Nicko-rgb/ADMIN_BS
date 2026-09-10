import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import CompanyService from '../service/companyService';
import type { CompanyDetail } from '../interfaces/company.interface';

// Detalle de una empresa — trae el tenantId de la URL (/companys/company/:tenantId) y carga
// país, ubigeo formateado, dueño y sucursales en un solo fetch.
export const useCompany = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();

    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        let active = true;
        const fetchCompany = async () => {
            setIsLoading(true);
            try {
                const data = await CompanyService.getByTenantId(tenantId);
                if (active) setCompany(data);
            } catch (err) {
                if (active) {
                    toast.error(handleApiError(err));
                    navigate('/companys');
                }
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchCompany();
        return () => { active = false; };
    }, [tenantId, navigate]);

    return { company, isLoading };
};

export default useCompany;
