import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import { usePlanUsage } from '../../../shared/hooks/usePlanUsage';
import { hasPlanRoom } from '../../../shared/utils/planUsage';
import CompanyService from '../service/companyService';
import ManageUserService from '../../users/service/manageUserService';
import { isUserFormValid, toUserPayload, userFormFromDetail } from '../../users/utils/userForm';
import { COMPANY_REQUIRED_FIELDS, EMPTY_COMPANY_FORM } from '../utils/tenantForm';
import useTenantForm from './useTenantForm';
import type { CompanyDetail } from '../interfaces/company.interface';
import type { UserFormValues } from '../../users/interfaces/user.interface';

export type CompanyErrorStatus = 'not_found' | 'forbidden' | 'unknown';

// Detalle de una empresa — trae el publicId de la URL (/companys/company/:publicId) y carga
// país, ubigeo formateado, dueño y sucursales en un solo fetch. El 404 (publicId inexistente)
// y el 403 (empresa fuera del scope del usuario, ver company.service.ts::getByPublicId en el
// backend) se distinguen por status para que la página elija entre NotFoundScreen y
// ForbiddenScreen — cualquier otro error queda como 'unknown', mismo mensaje genérico.
//
// También agrupa la edición de empresa y de dueño (botones "Editar" de Company.tsx) — mismo
// patrón que useUsers.ts (un hook por página, listado+edición juntos). La edición de empresa
// reusa useTenantForm (mismo que el paso 1 del wizard de alta), precargado con los datos
// ya traídos acá, sin fetch adicional. La edición de dueño usa FormUserManage (rol super_admin) —
// trae el detalle completo por id, la autoedición del propio perfil vive aparte en /home/profile
// (useProfile).
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

    // Modal de sucursal ──────────────────────────────────────────────────────────────────────
    // Solo apertura/cierre y cuál se edita (null = alta); su data la trae el propio modal.
    const [sucursalModal, setSucursalModal] = useState<{ isOpen: boolean; publicId: string | null }>({ isOpen: false, publicId: null });

    const openRegisterSucursal = () => {
        if (!hasPlanRoom(planUsage?.subsidiaries)) {
            return toast.warning('Alcanzaste el límite de tu plan para registrar sucursales, actualiza de plan.', { duration: 5000 });
        }
        setSucursalModal({ isOpen: true, publicId: null });
    };

    const openEditSucursal = (sucursalPublicId: string) => setSucursalModal({ isOpen: true, publicId: sucursalPublicId });
    const closeSucursal = useCallback(() => setSucursalModal({ isOpen: false, publicId: null }), []);

    // Modal de alta de usuario de sucursal — su estado y su envío viven en useUserAsingSucursal.
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const openUserModal = () => {
        if (!hasPlanRoom(planUsage?.users)) {
            return toast.warning('Alcanzaste el límite de tu plan para registrar usuarios, actualiza de plan.', { duration: 5000 });
        }
        setIsUserModalOpen(true);
    };

    const closeUserModal = () => setIsUserModalOpen(false);

    // Edición de dueño ───────────────────────────────────────────────────────────────────────
    // FormUserManage sobre el rol super_admin (GET/PUT /users/manage/super_admin/:id).
    const [isEditOwnerOpen, setIsEditOwnerOpen] = useState(false);
    const [ownerEditValues, setOwnerEditValues] = useState<UserFormValues | null>(null);
    const [isLoadingOwnerDetail, setIsLoadingOwnerDetail] = useState(false);
    const [isSavingOwner, setIsSavingOwner] = useState(false);

    const openEditOwner = async () => {
        if (!company?.owner) return;

        setIsEditOwnerOpen(true);
        setOwnerEditValues(null);
        setIsLoadingOwnerDetail(true);
        try {
            const detail = await ManageUserService.getById('super_admin', company.owner.publicId);
            setOwnerEditValues(userFormFromDetail('super_admin', detail, false));
        } catch (err) {
            toast.error(handleApiError(err));
            setIsEditOwnerOpen(false);
        } finally {
            setIsLoadingOwnerDetail(false);
        }
    };

    const closeEditOwner = () => {
        setIsEditOwnerOpen(false);
        setOwnerEditValues(null);
    };

    const setOwnerEditField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
        setOwnerEditValues((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const isOwnerEditValid = ownerEditValues !== null && isUserFormValid('super_admin', 'edit', ownerEditValues);

    const handleSubmitOwnerEdit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!company?.owner || !ownerEditValues || !isOwnerEditValid) return;

        setIsSavingOwner(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await ManageUserService.update('super_admin', company.owner.publicId, toUserPayload('super_admin', 'edit', ownerEditValues));
            toast.success(result.message);
            closeEditOwner();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingOwner(false);
        }
    };

    return {
        publicId, company, isLoading, errorStatus, errorMessage, retry: reload, planUsage, notificationsTier,

        isEditCompanyOpen, openEditCompany, closeEditCompany, isSavingCompany, handleSubmitCompanyEdit,
        companyEditProps: {
            ...companyEditFields,
            errors: showErrors ? companyEditErrors : {},
        },

        isSucursalOpen: sucursalModal.isOpen, editingSucursalId: sucursalModal.publicId,
        openRegisterSucursal, openEditSucursal, closeSucursal,

        isUserModalOpen, openUserModal, closeUserModal,

        isEditOwnerOpen, openEditOwner, closeEditOwner, isLoadingOwnerDetail, isSavingOwner, isOwnerEditValid, handleSubmitOwnerEdit,
        ownerEditValues, setOwnerEditField,
    };
};

export default useCompany;
