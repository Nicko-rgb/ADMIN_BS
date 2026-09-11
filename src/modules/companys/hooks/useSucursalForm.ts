import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { useUbigeoCascade } from '../../../shared/hooks/useUbigeoCascade';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import CompanyService from '../service/companyService';
import SucursalService from '../service/sucursalService';
import type { SucursalFormData, SucursalPayload } from '../interfaces/sucursal.interface';

export type SucursalParentErrorStatus = 'not_found' | 'forbidden' | 'unknown';

const EMPTY_FORM: SucursalFormData = {
    name: '',
    address: '',
    country_id: 0,
    ubigeo_id: 0,
    phone_cell: '',
    phone: '',
    latitude: '',
    longitude: '',
    description: '',
};

/**
 * Alta y edición de sucursal en un solo hook — mismo formulario para los dos modos, la
 * diferencia real es solo crear vs. actualizar. El modo lo decide la URL:
 * `/companys/company/:tenantId/sucursal/register` (alta) vs.
 * `/companys/company/:tenantId/sucursal/:sucursalTenantId/edit` (edición, `sucursalTenantId` presente).
 *
 * `companyTenantId` (el estado, no el param crudo de la URL) es la única fuente de verdad para
 * navegar de vuelta a la empresa y para el nombre del breadcrumb: en alta arranca con el
 * `tenantId` de la URL (es literalmente bajo qué empresa se registra); en edición se REEMPLAZA
 * apenas carga la sucursal por su `companyTenantId` real (el que devuelve el backend) — así
 * tocar a mano el segmento de empresa en la URL de edición no rompe nada, la sucursal ya sabe
 * cuál es su propio padre.
 */
export const useSucursalForm = () => {
    const { tenantId, sucursalTenantId } = useParams<{ tenantId: string; sucursalTenantId?: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(sucursalTenantId);

    const { countries, loadCountries } = useCatalogActive();
    const {
        level1Items: departments, level2Items: provinces, level3Items: districts,
        isLoadingLevel1, isLoadingLevel2, isLoadingLevel3,
        loadLevel, clearLevel,
    } = useUbigeoCascade();

    useEffect(() => { loadCountries(); }, [loadCountries]);
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));
    const isLoadingUbigeo = isLoadingLevel1 || isLoadingLevel2 || isLoadingLevel3;

    const [form, setForm] = useState<SucursalFormData>(EMPTY_FORM);
    const [departmentId, setDepartmentId] = useState(0);
    const [provinceId, setProvinceId] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyTenantId, setCompanyTenantId] = useState(tenantId);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [parentError, setParentError] = useState<SucursalParentErrorStatus | null>(null);

    // Empresa padre — nombre para el breadcrumb. En alta, esto además es la única validación de
    // que la empresa de la URL existe y es accesible ANTES de dejar completar el form (si no,
    // se muestra NotFound/Forbidden en vez de un form que va a fallar seguro al enviar). En
    // edición no bloquea nada — la sucursal ya demostró ser accesible al cargar; si esto falla
    // (raro) solo se pierde el nombre del breadcrumb.
    useEffect(() => {
        if (!companyTenantId) return;

        let active = true;
        CompanyService.getByTenantId(companyTenantId)
            .then((company) => {
                if (!active) return;
                setCompanyName(company.name);
                setParentError(null);
            })
            .catch((err) => {
                if (!active || isEditMode) return;
                const status = isAxiosError(err) ? err.response?.status : undefined;
                setParentError(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
            })
            .finally(() => {
                if (active && !isEditMode) setIsLoading(false);
            });

        return () => { active = false; };
    }, [companyTenantId, isEditMode]);

    // Precarga en modo edición — trae la sucursal, corrige `companyTenantId` a su padre real
    // (ver comentario del hook) y puebla la cascada de ubigeo en los tres niveles sin resetear
    // nada (es la carga inicial, no un cambio interactivo).
    useEffect(() => {
        if (!isEditMode || !sucursalTenantId) return;

        let active = true;
        SucursalService.getByTenantId(sucursalTenantId)
            .then((detail) => {
                if (!active) return;
                setForm({
                    name: detail.name,
                    address: detail.address,
                    country_id: detail.country?.id ?? 0,
                    ubigeo_id: detail.ubigeo?.id ?? 0,
                    phone_cell: detail.phoneCell,
                    phone: detail.phone ?? '',
                    latitude: detail.latitude ?? '',
                    longitude: detail.longitude ?? '',
                    description: detail.description ?? '',
                });
                if (detail.companyTenantId) setCompanyTenantId(detail.companyTenantId);
                if (detail.country?.id) loadLevel(1, { countryId: detail.country.id });
                if (detail.ubigeo?.departmentId) {
                    setDepartmentId(detail.ubigeo.departmentId);
                    loadLevel(2, { parentId: detail.ubigeo.departmentId });
                }
                if (detail.ubigeo?.provinceId) {
                    setProvinceId(detail.ubigeo.provinceId);
                    loadLevel(3, { parentId: detail.ubigeo.provinceId });
                }
            })
            .catch((err) => { if (active) toast.error(handleApiError(err)); })
            .finally(() => { if (active) setIsLoading(false); });

        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr una vez, al entrar en modo edición
    }, [isEditMode, sucursalTenantId]);

    const setField = (name: keyof SucursalFormData) => (value: string | number) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // País de la sucursal → primer nivel de la cascada de ubicación (departamento).
    const selectCountry = (countryId: number) => {
        setForm((prev) => ({ ...prev, country_id: countryId, ubigeo_id: 0 }));
        setDepartmentId(0);
        setProvinceId(0);
        clearLevel(2);
        clearLevel(3);

        if (countryId) loadLevel(1, { countryId });
        else clearLevel(1);
    };

    const selectDepartment = (id: number) => {
        setDepartmentId(id);
        setProvinceId(0);
        setForm((prev) => ({ ...prev, ubigeo_id: 0 }));
        clearLevel(3);

        if (id) loadLevel(2, { parentId: id });
        else clearLevel(2);
    };

    const selectProvince = (id: number) => {
        setProvinceId(id);
        setForm((prev) => ({ ...prev, ubigeo_id: 0 }));

        if (id) loadLevel(3, { parentId: id });
        else clearLevel(3);
    };

    const selectDistrict = (id: number) => {
        setForm((prev) => ({ ...prev, ubigeo_id: id }));
    };

    const isFormValid = Boolean(
        form.name.trim() && form.address.trim() && form.phone_cell.trim() && form.country_id && form.ubigeo_id
    );

    const goBack = () => navigate(companyTenantId ? `/companys/company/${companyTenantId}` : '/companys');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!companyTenantId) return;

        setIsSubmitting(true);
        try {
            const trimmed = trimValues(form);
            const payload: SucursalPayload = {
                name: trimmed.name,
                address: trimmed.address,
                country_id: trimmed.country_id,
                ubigeo_id: trimmed.ubigeo_id,
                phone_cell: trimmed.phone_cell,
                phone: trimmed.phone || null,
                latitude: trimmed.latitude ? Number(trimmed.latitude) : null,
                longitude: trimmed.longitude ? Number(trimmed.longitude) : null,
                description: trimmed.description || null,
            };

            const result = isEditMode && sucursalTenantId
                ? await SucursalService.update(sucursalTenantId, payload)
                : await SucursalService.register(companyTenantId, payload);

            toast.success(result.message);
            navigate(`/companys/company/${companyTenantId}`);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isEditMode, isLoading, isSubmitting, parentError,
        companyTenantId, companyName,
        form, setField, isFormValid,
        countryOptions, departments, provinces, districts, departmentId, provinceId,
        selectCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        handleSubmit, goBack,
    };
};

export default useSucursalForm;
