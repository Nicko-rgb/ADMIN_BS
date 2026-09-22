import { UploadCloud, UserPlus, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { FormActions } from '../../../shared/components';
import FormUserManage from '../../users/components/FormUserManage';
import useUserAsingSucursal from '../hooks/useUserAsingSucursal';
import type { CompanySubsidiary } from '../interfaces/company.interface';

interface UserAsingSucursalProps {
    onClose: () => void;
    subsidiaries: CompanySubsidiary[];
    onSaved: () => void;
}

/**
 * Modal de alta de un administrador/empleado — FormUserManage en modo alta, con las sucursales
 * de esta empresa. Se monta únicamente mientras está abierto (ver Company.tsx).
 */
export const UserAsingSucursal = ({ onClose, subsidiaries, onSaved }: UserAsingSucursalProps) => {
    const { values, setField, errors, isSubmitting, handleSubmit } = useUserAsingSucursal({ onClose, onSaved });

    return (
        <Modal isOpen onClose={onClose} title="Nuevo usuario" icon={UserPlus} size="lg">
            <form onSubmit={handleSubmit} noValidate>
                <FormUserManage
                    role={values.role}
                    mode="register"
                    values={values}
                    onChange={setField}
                    errors={errors}
                    sucursalOptions={subsidiaries.map((subsidiary) => ({ value: subsidiary.publicId, label: subsidiary.name }))}
                />

                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                    <Button text="Registrar usuario" icon={UploadCloud} size="lg" type="submit" loading={isSubmitting} />
                </FormActions>
            </form>
        </Modal>
    );
};

export default UserAsingSucursal;
