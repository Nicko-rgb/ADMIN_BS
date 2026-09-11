import { Building2, MapPin } from 'lucide-react';
import { InputField, SelectField, FormSection, FormRow } from '../../../shared/components';
import type { CompanyStepForm as CompanyStepFormData } from '../interfaces/companyRegistration.interface';
import type { UbigeoNode } from '../../system/interfaces/catalog.interface';

interface CompanyStepFormProps {
    form: CompanyStepFormData;
    setField: (name: keyof CompanyStepFormData) => (value: string | number | boolean) => void;
    countryOptions: { value: number; label: string }[];
    departments: UbigeoNode[];
    provinces: UbigeoNode[];
    districts: UbigeoNode[];
    departmentId: number;
    provinceId: number;
    selectCompanyCountry: (countryId: number) => void;
    selectDepartment: (id: number) => void;
    selectProvince: (id: number) => void;
    selectDistrict: (id: number) => void;
    isLoadingUbigeo: boolean;
}

/** Paso "empresa" del alta — datos generales y ubigeo. Reusado tal cual por la edición de empresa (ver companys/hooks/useCompanyFormFields). */
export const CompanyStepForm = ({
    form, setField, countryOptions,
    departments, provinces, districts, departmentId, provinceId,
    selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
}: CompanyStepFormProps) => (
    <>
        <FormSection title="Información general de la empresa" icon={Building2}>
            <FormRow>
                <InputField name="name" label="Nombre" value={form.name} onChange={(e) => setField('name')(e.target.value)} required />
                <InputField name="document" label="Documento (RUC)" value={form.document} onChange={(e) => setField('document')(e.target.value)} required />
            </FormRow>
            <FormRow>
                <InputField name="phone_cell" label="Teléfono celular" value={form.phone_cell} onChange={(e) => setField('phone_cell')(e.target.value)} required />
                <InputField name="phone" label="Teléfono fijo" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} />
            </FormRow>
        </FormSection>

        <FormSection title="Ubigeo" icon={MapPin}>
            <FormRow>
                <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => selectCompanyCountry(Number(e.target.value))} options={countryOptions} required />
                <SelectField
                    name="department_id"
                    label="Departamento"
                    value={departmentId || ''}
                    onChange={(e) => selectDepartment(Number(e.target.value))}
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    disabled={!form.country_id || isLoadingUbigeo}
                    required
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
                />
                <SelectField
                    name="ubigeo_id"
                    label="Distrito"
                    value={form.ubigeo_id || ''}
                    onChange={(e) => selectDistrict(Number(e.target.value))}
                    options={districts.map((d) => ({ value: d.id, label: d.name }))}
                    disabled={!provinceId || isLoadingUbigeo}
                    required
                />
            </FormRow>
            <FormRow>
                <InputField name="address" label="Dirección" value={form.address} onChange={(e) => setField('address')(e.target.value)} required />
            </FormRow>
        </FormSection>
    </>
);

export default CompanyStepForm;
