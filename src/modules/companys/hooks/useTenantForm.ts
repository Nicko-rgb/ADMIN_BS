import { useCallback, useEffect, useState } from 'react';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { useUbigeoCascade } from '../../../shared/hooks/useUbigeoCascade';
import { hasErrors, type FormErrors } from '../../../shared/utils/formErrors';
import { validateTenantForm, type UbigeoForm } from '../utils/tenantForm';

/**
 * Estado, países y cascada de ubigeo de un formulario de empresa o sucursal — comparten tabla y
 * formulario, solo cambian los campos y qué se hace al guardar. `extraRules` agrega validaciones
 * propias del formulario; `preload` carga datos existentes sin pasar por los `select*`.
 */
export const useTenantForm = <T extends UbigeoForm>(
    emptyForm: T,
    requiredFields: (keyof T)[],
    extraRules?: (form: T) => FormErrors<T>,
) => {
    const { countries, loadCountries } = useCatalogActive();
    const {
        level1Items: departments, level2Items: provinces, level3Items: districts,
        isLoadingLevel1, isLoadingLevel2, isLoadingLevel3,
        loadLevel, clearLevel,
    } = useUbigeoCascade();

    useEffect(() => { loadCountries(); }, [loadCountries]);

    const [form, setForm] = useState<T>(emptyForm);
    const [departmentId, setDepartmentId] = useState(0);
    const [provinceId, setProvinceId] = useState(0);

    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));
    const isLoadingUbigeo = isLoadingLevel1 || isLoadingLevel2 || isLoadingLevel3;

    const setField = (name: keyof T) => (value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // País → primer nivel de la cascada de ubicación (departamento).
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

    // Carga datos existentes (edición) y puebla los tres niveles para que los selects muestren la selección actual.
    const preload = useCallback((values: T, ids: { departmentId: number; provinceId: number }) => {
        setForm(values);
        setDepartmentId(ids.departmentId);
        setProvinceId(ids.provinceId);
        if (values.country_id) loadLevel(1, { countryId: values.country_id });
        if (ids.departmentId) loadLevel(2, { parentId: ids.departmentId });
        if (ids.provinceId) loadLevel(3, { parentId: ids.provinceId });
    }, [loadLevel]);

    const errors = { ...validateTenantForm(form, requiredFields, departmentId, provinceId), ...extraRules?.(form) };

    return {
        form, setField, preload, errors, isValid: !hasErrors(errors),
        countryOptions, departments, provinces, districts, departmentId, provinceId, isLoadingUbigeo,
        selectCountry, selectDepartment, selectProvince, selectDistrict,
    };
};

export default useTenantForm;
