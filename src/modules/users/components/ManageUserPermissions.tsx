import { ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { CheckboxField, FormActions } from '../../../shared/components';
import type { PermissionAdmin } from '../../system/interfaces/permission.interface';
import '../styles/ManageUserPermissions.css';

interface ManageUserPermissionsProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    catalog: PermissionAdmin[];
    assignedKeys: string[];
    onToggle: (key: string) => void;
    onSave: () => void;
    isLoading: boolean;
    isSaving?: boolean;
}

// Agrupa el catálogo por módulo — un bloque de checkboxes por módulo, en el mismo orden en que ya viene el catálogo (por módulo y luego key).
const groupByModule = (catalog: PermissionAdmin[]): [string, PermissionAdmin[]][] => {
    const groups = new Map<string, PermissionAdmin[]>();
    catalog.forEach((permission) => {
        const group = groups.get(permission.module) ?? [];
        group.push(permission);
        groups.set(permission.module, group);
    });
    return Array.from(groups.entries());
};

/** Modal de permisos directos de un usuario — un checkbox por permiso del catálogo, agrupados por módulo. Manda siempre el set completo tildado al guardar (reemplazo, no diff). */
export const ManageUserPermissions = ({ isOpen, onClose, userName, catalog, assignedKeys, onToggle, onSave, isLoading, isSaving = false }: ManageUserPermissionsProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permisos de ${userName}`} icon={ShieldCheck} size="lg">
        {isLoading ? (
            <div className="manage_permissions_loading">Cargando permisos...</div>
        ) : (
            <>
                {groupByModule(catalog).map(([module, permissions]) => (
                    <div key={module} className="manage_permissions_module">
                        <div className="manage_permissions_module_title">{module}</div>
                        <div className="manage_permissions_grid">
                            {permissions.map((permission) => (
                                <CheckboxField
                                    key={permission.key}
                                    name={permission.key}
                                    label={permission.label}
                                    checked={assignedKeys.includes(permission.key)}
                                    onChange={() => onToggle(permission.key)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                    <Button text="Guardar" icon={UploadCloud} size="lg" type="button" onClick={onSave} loading={isSaving} />
                </FormActions>
            </>
        )}
    </Modal>
);

export default ManageUserPermissions;
