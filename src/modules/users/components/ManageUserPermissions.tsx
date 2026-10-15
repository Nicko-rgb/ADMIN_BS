import { useEffect, useState } from 'react';
import { ShieldCheck, UploadCloud, X } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { CheckboxField, FormSection, FormActions } from '../../../shared/components';
import { MODULE_LABELS } from '../../system/utils/permissionConstants';
import UserPermissionService from '../service/userPermissionService';
import PermissionService from '../../system/service/permissionService';
import { usePermission } from '../../../shared/hooks/usePermission';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import type { PermissionAdmin, PermissionModule } from '../../system/interfaces/permission.interface';
import '../styles/ManageUserPermissions.css';

// Mismos permisos que exige la ruta en el backend — para el gate del botón/modal.
export const MANAGE_USER_PERMS = ['system.full_access', 'user.manage_all', 'user.administrator_manage', 'user.employee_manage'] as const;

interface ManageUserPermissionsProps {
    /** Usuario objetivo — null = modal cerrado. Con solo esto el modal carga y guarda solo. */
    publicId: string | null;
    userName: string;
    onClose: () => void;
    onSaved?: () => void;
}

type GroupedByModule = [PermissionModule, [string, PermissionAdmin[]][]][];

/**
 * Agrupa la servida dinámica en dos niveles: módulo real del código primero
 * (permission.module — bookings, companys...), grupo funcional después
 * (permission.groupName — space, sucursal, company...) dentro de cada módulo.
 * Agrupar solo por módulo daría bloques enormes (16+ permisos juntos en
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

/** Modal autocontenido de permisos directos de un usuario — un checkbox por permiso repartible, agrupados en tarjetas por módulo y grupo. Manda siempre el set completo tildado al guardar (reemplazo, no diff). */
export const ManageUserPermissions = ({ publicId, userName, onClose, onSaved }: ManageUserPermissionsProps) => {
    const can = usePermission();
    const canManagePermissions = can(...MANAGE_USER_PERMS);
    const [permissionCatalog, setPermissionCatalog] = useState<PermissionAdmin[]>([]);
    const [assignedKeys, setAssignedKeys] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Servida dinámica — recortada por usuario en el backend (system ve todo).
    useEffect(() => {
        if (!canManagePermissions) return;
        let active = true;

        PermissionService.listAssignable()
            .then((catalog) => { if (active) setPermissionCatalog(catalog); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, [canManagePermissions]);

    // Al abrir (publicId nuevo), trae el set actual del usuario para pretildar.
    useEffect(() => {
        if (!publicId) return;
        let active = true;

        setIsLoading(true);
        UserPermissionService.getByUserId(publicId)
            .then((keys) => { if (active) setAssignedKeys(keys); })
            .catch((err) => {
                if (!active) return;
                toast.error(handleApiError(err));
                onClose();
            })
            .finally(() => { if (active) setIsLoading(false); });

        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose estable por contrato del padre
    }, [publicId]);

    if (!canManagePermissions) return null;

    const toggle = (key: string) => {
        setAssignedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    const handleSave = async () => {
        if (!publicId) return;

        setIsSaving(true);
        toast.loading('Guardando permisos...');
        try {
            const result = await UserPermissionService.update(publicId, assignedKeys);
            toast.success(result.message);
            onSaved?.();
            onClose();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={publicId !== null} onClose={onClose} title={`Permisos de ${userName}`} icon={ShieldCheck} size="lg">
            {isLoading ? (
                <div className="manage_permissions_loading">Cargando permisos...</div>
            ) : (
                <>
                    {groupByModuleAndGroupName(permissionCatalog).map(([module, groups]) => (
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
                                                onChange={() => toggle(permission.key)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </FormSection>
                    ))}

                    <FormActions>
                        <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={onClose} />
                        <Button text="Guardar" icon={UploadCloud} size="lg" type="button" onClick={handleSave} loading={isSaving} />
                    </FormActions>
                </>
            )}
        </Modal>
    );
};

export default ManageUserPermissions;
