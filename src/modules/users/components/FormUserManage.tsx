import { useEffect } from 'react';
import { IdCard, Store, UserPlus } from 'lucide-react';
import { InputField, SelectField, CheckboxField, ToggleField, FormSection, FormRow } from '../../../shared/components';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { DOCUMENT_TYPE_OPTIONS } from '../utils/userConstants';
import { getUserFormFields, isSucursalRole } from '../utils/userForm';
import type { DocumentType, ManagedRole, UserFormMode, UserFormValues } from '../interfaces/user.interface';
import '../styles/FormUserManage.css';

interface FormUserManageProps {
    // Rol con el que se trabaja — en edición, el rol actual del usuario.
    role: ManagedRole;
    mode: UserFormMode;
    values: UserFormValues;
    onChange: <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => void;
    // Sucursales elegibles para administrador/empleado — se muestran si `values.sucursales` no es null.
    sucursalOptions?: { value: string; label: string }[];
}

/**
 * Campos de alta/edición de un usuario según su rol y el modo (ver getUserFormFields) — solo
 * renderiza y emite cada cambio; el estado, la validación y el envío los maneja el hook del módulo
 * que lo usa (isUserFormValid, toUserPayload). Países y roles salen de useCatalogActive.
 */
export const FormUserManage = ({ role, mode, values, onChange, sucursalOptions = [] }: FormUserManageProps) => {
    const { countries, loadCountries, roles, loadRoles } = useCatalogActive();
    const fields = getUserFormFields(role, mode, values);
    const showRole = Boolean(fields.role);

    useEffect(() => {
        loadCountries();
        if (showRole) loadRoles();
    }, [loadCountries, loadRoles, showRole]);

    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));
    const phoneCode = countries.find((country) => country.id === values.country_id)?.phoneCode;
    const roleOptions = roles.filter((item) => isSucursalRole(item.key)).map((item) => ({ value: item.key, label: item.label }));

    const toggleSucursal = (tenantId: string) => {
        const selected = values.sucursales ?? [];
        onChange('sucursales', selected.includes(tenantId) ? selected.filter((id) => id !== tenantId) : [...selected, tenantId]);
    };

    return (
        <>
            <FormSection title="Datos personales" icon={UserPlus}>
                <FormRow>
                    <InputField name="first_name" label="Nombres" value={values.first_name} onChange={(e) => onChange('first_name', e.target.value)} required={fields.first_name?.required} />
                    <InputField name="last_name" label="Apellidos" value={values.last_name} onChange={(e) => onChange('last_name', e.target.value)} required={fields.last_name?.required} />
                </FormRow>
                <FormRow>
                    <InputField name="date_birth" label="Fecha de nacimiento" type="date" value={values.date_birth} onChange={(e) => onChange('date_birth', e.target.value)} required={fields.date_birth?.required} />
                    <InputField name="phone" label="Teléfono celular" isPhone phoneCode={phoneCode} value={values.phone} onChange={(e) => onChange('phone', e.target.value)} required={fields.phone?.required} />
                </FormRow>
            </FormSection>

            <FormSection title="Acceso y contacto" icon={IdCard}>
                <FormRow>
                    <InputField name="email" label="Correo" type="email" value={values.email} onChange={(e) => onChange('email', e.target.value)} required={fields.email?.required} />
                    {fields.password && (
                        <InputField name="password" label="Contraseña" type="password" autoComplete="new-password" value={values.password} onChange={(e) => onChange('password', e.target.value)} required={fields.password.required} />
                    )}
                </FormRow>
                <FormRow>
                    <SelectField name="country_id" label="País" value={values.country_id || ''} onChange={(e) => onChange('country_id', Number(e.target.value))} options={countryOptions} required={fields.country_id?.required} />
                    <SelectField name="document_type" label="Tipo de documento" value={values.document_type} onChange={(e) => onChange('document_type', e.target.value as DocumentType)} options={DOCUMENT_TYPE_OPTIONS} required={fields.document_type?.required} />
                </FormRow>
                <FormRow>
                    <InputField name="document_number" label="Número de documento" value={values.document_number} onChange={(e) => onChange('document_number', e.target.value)} required={fields.document_number?.required} />
                    {fields.is_enabled && (
                        <ToggleField name="is_enabled" label="Habilitado" checked={values.is_enabled} onChange={(e) => onChange('is_enabled', e.target.checked)} />
                    )}
                </FormRow>
            </FormSection>

            {showRole && (
                <FormSection title="Acceso a sucursal" icon={Store}>
                    <FormRow>
                        <SelectField name="role" label="Rol" value={values.role} onChange={(e) => onChange('role', e.target.value as ManagedRole)} options={roleOptions} required />
                    </FormRow>
                    {fields.sucursales && (
                        sucursalOptions.length > 0 ? (
                            <div className="form_user_manage_sucursales">
                                {sucursalOptions.map((sucursal) => (
                                    <CheckboxField
                                        key={sucursal.value}
                                        name={`sucursal_${sucursal.value}`}
                                        label={sucursal.label}
                                        checked={(values.sucursales ?? []).includes(sucursal.value)}
                                        onChange={() => toggleSucursal(sucursal.value)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <span className="form_user_manage_empty">No hay sucursales disponibles</span>
                        )
                    )}
                </FormSection>
            )}
        </>
    );
};

export default FormUserManage;
