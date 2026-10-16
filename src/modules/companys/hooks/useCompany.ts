import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import { usePlanUsage } from '../../../shared/hooks/usePlanUsage';
import { hasPlanRoom } from '../../../shared/utils/planUsage';
import CompanyService from '../service/companyService';
import { COMPANY_REQUIRED_FIELDS, EMPTY_COMPANY_FORM } from '../utils/tenantForm';
import useTenantForm from './useTenantForm';
import type { CompanyDetail } from '../interfaces/company.interface';

export type CompanyErrorStatus = 'not_found' | 'forbidden' | 'unknown';

// Detalle de una empresa — carga país, ubigeo formateado, usuarios (incluyendo dueño) y sucursales.
export const useCompany = () => {
    const { publicId } = useParams<{ publicId: string }>();

    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<CompanyErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        if (!publicId) return;
        let active = true;

        const fetchCompany = async () => {
            setIsLoading(true);
            setErrorStatus(null);
            try {
                const data = await CompanyService.getByPublicId(publicId);
                if (active) setCompany(data);
            } catch (err) {
                if (!active) return;
                const status = isAxiosError(err) ? err.response?.status : undefined;
                setErrorStatus(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
                setErrorMessage(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchCompany();

        return () => { active = false; };
    }, [publicId, reloadToken]);

    const { planUsage, notificationsTier, reloadPlanUsage } = usePlanUsage(company?.publicId);

    const reload = () => {
        setReloadToken((token) => token + 1);
        reloadPlanUsage();
    };

    // Edición de empresa ────────────────────────────────────────────────────────────────────
    const { preload, isValid: isCompanyEditValid, errors: companyEditErrors, ...companyEditFields } = useTenantForm(EMPTY_COMPANY_FORM, COMPANY_REQUIRED_FIELDS);
    const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    // Los errores por campo recién se pintan cuando se intenta guardar con el form incompleto.
    const [showCompanyEditErrors, setShowCompanyEditErrors] = useState(false);

    const openEditCompany = () => {
        if (!company) return;
        setShowCompanyEditErrors(false);
        preload(
            {
                name: company.name,
                document: company.document,
                country_id: company.country?.id ?? 0,
                ubigeo_id: company.ubigeo?.id ?? 0,
                address: company.address,
                phone_cell: company.phoneCell,
                phone: company.phone ?? '',
            },
            { departmentId: company.ubigeo?.departmentId ?? 0, provinceId: company.ubigeo?.provinceId ?? 0 },
        );
        setIsEditCompanyOpen(true);
    };

    const closeEditCompany = () => setIsEditCompanyOpen(false);

    const handleSubmitCompanyEdit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!publicId) return;

        if (!isCompanyEditValid) {
            setShowCompanyEditErrors(true);
            toast.error('Completa los campos obligatorios para continuar');
            return;
        }

        setIsSavingCompany(true);
        try {
            const payload = trimValues(companyEditFields.form);
            const result = await CompanyService.updateByPublicId(publicId, payload);
            setCompany(result.data);
            toast.success(result.message);
            closeEditCompany();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingCompany(false);
        }
    };

    const openRegisterSucursal = () => {
        if (!hasPlanRoom(planUsage?.subsidiaries)) {
            return toast.warning('Alcanzaste el límite de tu plan para registrar sucursales, actualiza de plan.', { duration: 5000 });
        }
    };

    // Modal de alta de usuario de sucursal
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const openUserModal = () => {
        if (!hasPlanRoom(planUsage?.users)) {
            return toast.warning('Alcanzaste el límite de tu plan para registrar usuarios, actualiza de plan.', { duration: 5000 });
        }
        setIsUserModalOpen(true);
    };

    const closeUserModal = () => setIsUserModalOpen(false);

    return {
        company,
        isLoading,
        errorStatus,
        errorMessage,
        retry: reload,
        planUsage,
        notificationsTier,

        isEditCompanyOpen,
        openEditCompany,
        closeEditCompany,
        isSavingCompany,
        handleSubmitCompanyEdit,
        companyEditProps: {
            ...companyEditFields,
            errors: showCompanyEditErrors ? companyEditErrors : {},
        },

        openRegisterSucursal,

        isUserModalOpen,
        openUserModal,
        closeUserModal,
    };
};

export default useCompany;
