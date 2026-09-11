import { InputField, SelectField, FormSection, FormRow } from '../../../shared/components';
import { DOCUMENT_TYPE_OPTIONS } from '../utils/userConstants';
import type { UpdateOwnProfilePayload, DocumentType } from '../interfaces/user.interface';

interface UserProfileFieldsProps {
    form: Required<UpdateOwnProfilePayload>;
    setField: (name: keyof UpdateOwnProfilePayload) => (value: string | number | boolean | null) => void;
    countryOptions: { value: number; label: string }[];
}

/** Datos personales de un usuario — nombre, correo, contacto y documento. Reusado por UserEdit.tsx (system edita a cualquiera, con su propia sección de Acceso aparte) y Profile.tsx (autoedición, sin esa sección). */
export const UserProfileFields = ({ form, setField, countryOptions }: UserProfileFieldsProps) => (
    <>
        <FormSection title="Identificación">
            <FormRow>
                <InputField name="first_name" label="Nombre" value={form.first_name} onChange={(e) => setField('first_name')(e.target.value)} required />
                <InputField name="last_name" label="Apellido" value={form.last_name} onChange={(e) => setField('last_name')(e.target.value)} required />
            </FormRow>
            <FormRow>
                <InputField name="email" label="Correo" type="email" value={form.email} onChange={(e) => setField('email')(e.target.value)} />
            </FormRow>
        </FormSection>

        <FormSection title="Contacto">
            <FormRow>
                <InputField name="phone" label="Teléfono" value={form.phone ?? ''} onChange={(e) => setField('phone')(e.target.value)} />
                <SelectField name="country_id" label="País" value={form.country_id || ''} onChange={(e) => setField('country_id')(Number(e.target.value))} options={countryOptions} required />
            </FormRow>
        </FormSection>

        <FormSection title="Documento">
            <FormRow>
                <SelectField name="document_type" label="Tipo de documento" value={form.document_type ?? ''} onChange={(e) => setField('document_type')(e.target.value as DocumentType)} options={DOCUMENT_TYPE_OPTIONS} />
                <InputField name="document_number" label="Número de documento" value={form.document_number ?? ''} onChange={(e) => setField('document_number')(e.target.value)} />
            </FormRow>
            <FormRow>
                <InputField name="date_birth" label="Fecha de nacimiento" type="date" value={form.date_birth ?? ''} onChange={(e) => setField('date_birth')(e.target.value)} />
            </FormRow>
        </FormSection>
    </>
);

export default UserProfileFields;
