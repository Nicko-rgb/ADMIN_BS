import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import CompanyService from '../service/companyService';
import useUserEdit from '../../users/hooks/useUserEdit';
import useCompanyFormFields from './useCompanyFormFields';
import type { CompanyDetail } from '../interfaces/company.interface';

export type CompanyErrorStatus = 'not_found' | 'forbidden' | 'unknown';

// Detalle de una empresa — trae el tenantId de la URL (/companys/company/:tenantId) y carga
// país, ubigeo formateado, dueño y sucursales en un solo fetch. El 404 (tenantId inexistente)
// y el 403 (empresa fuera del scope del usuario, ver company.service.ts::getByTenantId en el
// backend) se distinguen por status para que la página elija entre NotFoundScreen y
// ForbiddenScreen — cualquier otro error queda como 'unknown', mismo mensaje genérico.
//
// También agrupa la edición de empresa y de dueño (botones "Editar" de Company.tsx) — mismo
// patrón que useUsers.ts (un hook por página, listado+edición juntos). La edición de empresa
// reusa useCompanyFormFields (mismo que el paso 1 del wizard de alta), precargado con los datos
// ya traídos acá, sin fetch adicional. La edición de dueño reusa useUserEdit (PUT /users/:id,
// solo `system`) — trae el detalle completo por id, la autoedición del propio perfil vive aparte
// en /home/profile (useProfile).
export const useCompany = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const { countries, loadCountries } = useCatalogActive();

    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState<CompanyErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => { loadCountries(); }, [loadCountries]);
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

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

    // Edición de empresa ────────────────────────────────────────────────────────────────────
    const companyFields = useCompanyFormFields();
    const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    const openEditCompany = () => {
        if (!company) return;
        companyFields.preload(
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
        if (!tenantId) return;

        setIsSavingCompany(true);
        try {
            const payload = trimValues({
                name: companyFields.companyForm.name,
                document: companyFields.companyForm.document,
                country_id: companyFields.companyForm.country_id,
                ubigeo_id: companyFields.companyForm.ubigeo_id,
                address: companyFields.companyForm.address,
                phone_cell: companyFields.companyForm.phone_cell,
                phone: companyFields.companyForm.phone,
            });
            const result = await CompanyService.updateByTenantId(tenantId, payload);
            setCompany(result.data);
            toast.success(result.message);
            closeEditCompany();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingCompany(false);
        }
    };

    // Edición de dueño ───────────────────────────────────────────────────────────────────────
    // Reusa useUserEdit (PUT /api/users/:id, `user.manage_all`) — la misma edición que usa
    // useUsers.ts en el listado de usuarios. Solo `system` la ve (Company.tsx la gatea con
    // usePermission), un super_admin edita su propio perfil desde /home/profile en cambio.
    const ownerEdit = useUserEdit();

    const openEditOwner = () => {
        if (!company?.owner) return;
        ownerEdit.openEdit(company.owner.id);
    };

    const handleSubmitOwnerEdit = (e: FormEvent<HTMLFormElement>) => {
        ownerEdit.submit(e, () => tenantId && fetchCompany(tenantId));
    };

    return {
        tenantId, company, isLoading, errorStatus, errorMessage, retry,
        countryOptions,

        isEditCompanyOpen, openEditCompany, closeEditCompany, isSavingCompany, handleSubmitCompanyEdit,
        companyEditForm: companyFields.companyForm, setCompanyEditField: companyFields.setCompanyField,
        companyEditDepartments: companyFields.departments, companyEditProvinces: companyFields.provinces, companyEditDistricts: companyFields.districts,
        companyEditDepartmentId: companyFields.departmentId, companyEditProvinceId: companyFields.provinceId,
        selectCompanyEditCountry: companyFields.selectCompanyCountry, selectCompanyEditDepartment: companyFields.selectDepartment,
        selectCompanyEditProvince: companyFields.selectProvince, selectCompanyEditDistrict: companyFields.selectDistrict,
        isLoadingCompanyEditUbigeo: companyFields.isLoadingUbigeo,

        isEditOwnerOpen: ownerEdit.isEditOpen, openEditOwner, closeEditOwner: ownerEdit.closeEdit,
        isLoadingOwnerDetail: ownerEdit.isLoadingDetail, isSavingOwner: ownerEdit.isSaving,
        ownerEditForm: ownerEdit.form, setOwnerEditField: ownerEdit.setField, handleSubmitOwnerEdit,
    };
};

export default useCompany;
