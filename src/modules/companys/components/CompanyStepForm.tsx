import { Building2, MapPin } from 'lucide-react';
import { InputField, SelectField, FormSection, FormRow } from '../../../shared/components';
import type { CompanyStepErrors, CompanyStepForm as CompanyStepFormData } from '../interfaces/companyRegistration.interface';
import type { UbigeoNode } from '../../../shared/interfaces/catalog.interface';

// Misma forma que devuelve useTenantForm, para volcarla con spread desde el hook que lo usa.
export interface CompanyStepFormProps {
    form: CompanyStepFormData;
    setField: (name: keyof CompanyStepFormData) => (value: string | number | boolean) => void;
    errors?: CompanyStepErrors;
    countryOptions: { value: number; label: string }[];
    departments: UbigeoNode[];
    provinces: UbigeoNode[];
    districts: UbigeoNode[];
    departmentId: number;
    provinceId: number;
    selectCountry: (countryId: number) => void;
    selectDepartment: (id: number) => void;
    selectProvince: (id: number) => void;
    selectDistrict: (id: number) => void;
    isLoadingUbigeo: boolean;
}

/** Paso "empresa" del alta — datos generales y ubigeo. Reusado tal cual por la edición de empresa (ver companys/hooks/useTenantForm). */
export const CompanyStepForm = ({
    form, setField, errors = {}, countryOptions,
    departments, provinces, districts, departmentId, provinceId,
    selectCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
}: CompanyStepFormProps) => (
    <>
        <FormSection title="Información general de la empresa" icon={Building2}>
            <FormRow>
                <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required maxLength={200} error={errors.name} />
                <InputField name="document" label="Documento (RUC)" value={form.document} onChange={(e) => setField('document')(e.target.value)} required numberOnly="integer" maxLength={20} error={errors.document} />
            </FormRow>
            <FormRow>
                <InputField name="phone_cell" label="Teléfono celular" value={form.phone_cell} onChange={(e) => setField('phone_cell')(e.target.value)} required numberOnly="integer" maxLength={20} error={errors.phone_cell} />
                <InputField name="phone" label="Teléfono fijo (Opcional)" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} numberOnly="integer" maxLength={20} />
            </FormRow>
        </FormSection>

        <FormSection title="Ubigeo" icon={MapPin}>
            <FormRow>
                <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => selectCountry(Number(e.target.value))} options={countryOptions} required error={errors.country_id} />
                <SelectField
                    name="department_id"
                    label="Departamento"
                    value={departmentId || ''}
                    onChange={(e) => selectDepartment(Number(e.target.value))}
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    disabled={!form.country_id || isLoadingUbigeo}
                    required
                    error={errors.department_id}
                />
            </FormRow>
            <FormRow>
                <SelectField
                    name="province_id"
                    label="Provincia"
                    value={provinceId || ''}
                    onChange={(e) => selectProvince(Number(e.target.value))}
                    options={provinces.map((p) => ({ value: p.id, label: p.name }))}
                    disabled={!departmentId || isLoadingUbigeo}
                    required
                    error={errors.province_id}
                />
                <SelectField
                    name="ubigeo_id"
                    label="Distrito"
                    value={form.ubigeo_id || ''}
                    onChange={(e) => selectDistrict(Number(e.target.value))}
                    options={districts.map((d) => ({ value: d.id, label: d.name }))}
                    disabled={!provinceId || isLoadingUbigeo}
                    required
                    error={errors.ubigeo_id}
                />
            </FormRow>
            <FormRow>
                <InputField name="address" label="Dirección" value={form.address} onChange={(e) => setField('address')(e.target.value)} required maxLength={255} error={errors.address} />
            </FormRow>
        </FormSection>
    </>
);

export default CompanyStepForm;
