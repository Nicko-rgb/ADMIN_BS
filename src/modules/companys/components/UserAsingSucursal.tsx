import { UserPlus, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { FormActions } from '../../../shared/components';
import FormUserManage from '../../users/components/FormUserManage';
import type { CompanySubsidiary } from '../interfaces/company.interface';
import type { UserFormValues } from '../../users/interfaces/user.interface';

interface UserAsingSucursalProps {
    isOpen: boolean;
    onClose: () => void;
    subsidiaries: CompanySubsidiary[];
    values: UserFormValues;
    setField: <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => void;
}

/** Modal de alta de un administrador/empleado — FormUserManage en modo alta, con las sucursales de esta empresa. */
export const UserAsingSucursal = ({ isOpen, onClose, subsidiaries, values, setField }: UserAsingSucursalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo usuario" icon={UserPlus} size="lg">
        <FormUserManage
            role={values.role}
            mode="register"
            values={values}
            onChange={setField}
            sucursalOptions={subsidiaries.map((subsidiary) => ({ value: subsidiary.tenantId, label: subsidiary.name }))}
        />

        <FormActions>
            <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
        </FormActions>
    </Modal>
);

export default UserAsingSucursal;
