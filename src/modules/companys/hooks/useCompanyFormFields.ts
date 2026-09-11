import { useCallback, useState } from 'react';
import { useUbigeoCascade } from '../../../shared/hooks/useUbigeoCascade';
import type { CompanyStepForm } from '../interfaces/companyRegistration.interface';

const EMPTY_COMPANY_FORM: CompanyStepForm = {
    name: '',
    document: '',
    country_id: 0,
    ubigeo_id: 0,
    address: '',
    phone_cell: '',
    phone: '',
};

/**
 * Estado y cascada de ubigeo (departamento → provincia → distrito) del paso "empresa" —
 * compartido entre el wizard de alta (useRegisterCompany) y la edición de empresa
 * (useCompany::editCompany), que solo difieren en qué hacen con el resultado (crear vs. PUT).
 * Arranca vacío; `preload` lo carga con datos existentes sin pasar por los `select*`
 * interactivos (esos resetean los hijos a propósito, acá no corresponde).
 */
export const useCompanyFormFields = () => {
    const {
        level1Items: departments, level2Items: provinces, level3Items: districts,
        isLoadingLevel1, isLoadingLevel2, isLoadingLevel3,
        loadLevel, clearLevel,
    } = useUbigeoCascade();

    const [companyForm, setCompanyForm] = useState<CompanyStepForm>(EMPTY_COMPANY_FORM);
    const [departmentId, setDepartmentId] = useState(0);
    const [provinceId, setProvinceId] = useState(0);

    const isLoadingUbigeo = isLoadingLevel1 || isLoadingLevel2 || isLoadingLevel3;

    const setCompanyField = (name: keyof CompanyStepForm) => (value: string | number | boolean) => {
        setCompanyForm((prev) => ({ ...prev, [name]: value }));
    };

    // País de la empresa → primer nivel de la cascada de ubicación (departamento).
    const selectCompanyCountry = (countryId: number) => {
        setCompanyForm((prev) => ({ ...prev, country_id: countryId, ubigeo_id: 0 }));
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
        setCompanyForm((prev) => ({ ...prev, ubigeo_id: 0 }));
        clearLevel(3);

        if (id) loadLevel(2, { parentId: id });
        else clearLevel(2);
    };

    const selectProvince = (id: number) => {
        setProvinceId(id);
        setCompanyForm((prev) => ({ ...prev, ubigeo_id: 0 }));

        if (id) loadLevel(3, { parentId: id });
        else clearLevel(3);
    };

    const selectDistrict = (id: number) => {
        setCompanyForm((prev) => ({ ...prev, ubigeo_id: id }));
    };

    /**
     * Precarga el form con datos ya existentes (edición) y puebla los tres niveles de la
     * cascada para que los selects muestren la selección actual — a diferencia de los
     * `select*` de arriba, no resetea nada porque acá no es un cambio interactivo.
     */
    const preload = useCallback((form: CompanyStepForm, ids: { departmentId: number; provinceId: number }) => {
        setCompanyForm(form);
        setDepartmentId(ids.departmentId);
        setProvinceId(ids.provinceId);
        if (form.country_id) loadLevel(1, { countryId: form.country_id });
        if (ids.departmentId) loadLevel(2, { parentId: ids.departmentId });
        if (ids.provinceId) loadLevel(3, { parentId: ids.provinceId });
    }, [loadLevel]);

    const isCompanyStepValid = Boolean(
        companyForm.name.trim() && companyForm.document.trim() && companyForm.phone_cell.trim()
        && companyForm.address.trim() && companyForm.country_id && companyForm.ubigeo_id
    );

    return {
        companyForm, setCompanyField, isCompanyStepValid,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        preload,
    };
};

export default useCompanyFormFields;
