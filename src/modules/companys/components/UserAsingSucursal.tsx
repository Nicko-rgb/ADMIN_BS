import { UserPlus, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { SelectField, FormSection, FormRow, FormActions } from '../../../shared/components';
import OwnerStepForm from './OwnerStepForm';
import type { OwnerStepForm as OwnerStepFormData } from '../interfaces/companyRegistration.interface';
import type { CompanySubsidiary } from '../interfaces/company.interface';

interface UserAsingSucursalProps {
    isOpen: boolean;
    onClose: () => void;
    roleOptions: { value: string; label: string }[];
    roleKey: string;
    setRoleKey: (value: string) => void;
    subsidiaries: CompanySubsidiary[];
    sucursalTenantId: string;
    setSucursalTenantId: (value: string) => void;
    ownerForm: OwnerStepFormData;
    setOwnerField: (name: keyof OwnerStepFormData) => (value: string | number) => void;
    countryOptions: { value: number; label: string }[];
}

/** Modal de alta de un administrador/empleado — datos personales (OwnerStepForm) + rol y sucursal asignada dentro de esta empresa. */
export const UserAsingSucursal = ({
    isOpen, onClose, roleOptions, roleKey, setRoleKey, subsidiaries, sucursalTenantId, setSucursalTenantId,
    ownerForm, setOwnerField, countryOptions,
}: UserAsingSucursalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo usuario" icon={UserPlus} size="lg">
        <OwnerStepForm form={ownerForm} setField={setOwnerField} countryOptions={countryOptions} />

        <FormSection title="Acceso a la empresa">
            <FormRow>
                <SelectField name="role" label="Rol" value={roleKey} onChange={(e) => setRoleKey(String(e.target.value))} options={roleOptions} required />
                <SelectField
                    name="sucursal"
                    label="Sucursal"
                    value={sucursalTenantId}
                    onChange={(e) => setSucursalTenantId(String(e.target.value))}
                    options={subsidiaries.map((s) => ({ value: s.tenantId, label: s.name }))}
                    required
                />
            </FormRow>
        </FormSection>

        <FormActions>
            <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
        </FormActions>
    </Modal>
);

export default UserAsingSucursal;
