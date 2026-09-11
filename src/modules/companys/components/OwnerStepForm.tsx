import { UserPlus, Phone, IdCard } from 'lucide-react';
import { InputField, SelectField, FormSection, FormRow } from '../../../shared/components';
import { DOCUMENT_TYPE_OPTIONS } from '../../users/utils/userConstants';
import type { DocumentType } from '../../users/interfaces/user.interface';
import type { OwnerStepForm as OwnerStepFormData } from '../interfaces/companyRegistration.interface';

interface OwnerStepFormProps {
    form: OwnerStepFormData;
    setField: (name: keyof OwnerStepFormData) => (value: string | number) => void;
    countryOptions: { value: number; label: string }[];
    // La edición del propio perfil nunca toca password — eso va por un flujo aparte (igual criterio que UserEdit.tsx).
    showPassword?: boolean;
}

/** Paso "dueño" del alta — datos personales, contacto y documento. Reusado tal cual por la edición del propio perfil (ver companys/hooks/useOwnerFormFields). */
export const OwnerStepForm = ({ form, setField, countryOptions, showPassword = true }: OwnerStepFormProps) => (
    <>
        <FormSection title="Datos personales" icon={UserPlus}>
            <FormRow>
                <InputField name="first_name" label="Nombre" value={form.first_name} onChange={(e) => setField('first_name')(e.target.value)} required />
                <InputField name="last_name" label="Apellido" value={form.last_name} onChange={(e) => setField('last_name')(e.target.value)} required />
            </FormRow>
            <FormRow>
                <InputField name="date_birth" label="Fecha de nacimiento" type="date" value={form.date_birth} onChange={(e) => setField('date_birth')(e.target.value)} />
            </FormRow>
        </FormSection>

        <FormSection title="Contacto y acceso" icon={Phone}>
            <FormRow>
                <InputField name="email" label="Correo" type="email" value={form.email} onChange={(e) => setField('email')(e.target.value)} required />
                {showPassword && (
                    <InputField name="password" label="Contraseña" type="password" value={form.password} onChange={(e) => setField('password')(e.target.value)} required />
                )}
            </FormRow>
            <FormRow>
                <InputField name="phone" label="Número de celular" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} required />
                <SelectField name="owner_country_id" label="País" value={form.country_id || ''} onChange={(e) => setField('country_id')(Number(e.target.value))} options={countryOptions} required />
            </FormRow>
        </FormSection>

        <FormSection title="Documento de identidad" icon={IdCard}>
            <FormRow>
                <SelectField name="document_type" label="Tipo de documento" value={form.document_type} onChange={(e) => setField('document_type')(e.target.value as DocumentType)} options={DOCUMENT_TYPE_OPTIONS} required />
                <InputField name="document_number" label="Número de documento" value={form.document_number} onChange={(e) => setField('document_number')(e.target.value)} required />
            </FormRow>
        </FormSection>
    </>
);

export default OwnerStepForm;
