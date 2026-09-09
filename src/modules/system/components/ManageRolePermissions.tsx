import { ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { CheckboxField, FormSection, FormActions } from '../../../shared/components';
import { MODULE_LABELS } from '../utils/permissionConstants';
import type { PermissionAdmin, PermissionModule } from '../interfaces/permission.interface';
import '../../users/styles/ManageUserPermissions.css';

interface ManageRolePermissionsProps {
    isOpen: boolean;
    onClose: () => void;
    roleLabel: string;
    catalog: PermissionAdmin[];
    assignedKeys: string[];
    onToggle: (key: string) => void;
    onSave: () => void;
    isLoading: boolean;
    isSaving?: boolean;
}

type GroupedByModule = [PermissionModule, [string, PermissionAdmin[]][]][];

/**
 * Agrupa el catálogo en dos niveles — mismo criterio que ManageUserPermissions.tsx: módulo real
 * del código primero (permission.module), grupo funcional después (permission.groupName) dentro
 * de cada módulo. Agrupar solo por módulo daría bloques enormes (16+ permisos juntos en
 * `companys`); solo por grupo pierde el panorama de a qué módulo pertenece cada cosa.
 */
const groupByModuleAndGroupName = (catalog: PermissionAdmin[]): GroupedByModule => {
    const moduleGroups = new Map<PermissionModule, Map<string, PermissionAdmin[]>>();

    catalog.forEach((permission) => {
        const groupNames = moduleGroups.get(permission.module) ?? new Map<string, PermissionAdmin[]>();
        const permissions = groupNames.get(permission.groupName) ?? [];
        permissions.push(permission);
        groupNames.set(permission.groupName, permissions);
        moduleGroups.set(permission.module, groupNames);
    });

    return Array.from(moduleGroups.entries()).map(([module, groupNames]) => [module, Array.from(groupNames.entries())]);
};

/**
 * Modal de permisos base de un rol — mismo patrón que ManageUserPermissions.tsx (checklist en
 * tarjetas por módulo vía FormSection, subdividido por grupo funcional dentro de cada una,
 * reemplazo completo al guardar) pero apuntando a un rol: editar acá cambia de una sola vez los
 * permisos de TODOS los usuarios que tienen ese rol, sin tocarlos uno por uno.
 */
export const ManageRolePermissions = ({ isOpen, onClose, roleLabel, catalog, assignedKeys, onToggle, onSave, isLoading, isSaving = false }: ManageRolePermissionsProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permisos del rol: ${roleLabel}`} icon={ShieldCheck} size="lg">
        {isLoading ? (
            <div className="manage_permissions_loading">Cargando permisos...</div>
        ) : (
            <>
                {groupByModuleAndGroupName(catalog).map(([module, groups]) => (
                    <FormSection key={module} title={MODULE_LABELS[module] ?? module}>
                        {groups.map(([groupName, permissions]) => (
                            <div key={groupName} className="manage_permissions_module">
                                <div className="manage_permissions_module_title">{groupName}</div>
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
                    </FormSection>
                ))}

                <FormActions>
                    <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                    <Button text="Guardar" icon={UploadCloud} size="lg" type="button" onClick={onSave} loading={isSaving} />
                </FormActions>
            </>
        )}
    </Modal>
);

export default ManageRolePermissions;
