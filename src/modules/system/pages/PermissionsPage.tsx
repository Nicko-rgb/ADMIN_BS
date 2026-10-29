import { useState } from 'react';
import { Pencil, Search, ShieldCheck, ShieldUser, Trash2 } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField, SelectField, Tabs, LoadingScreen, EmptyScreen } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { usePermissions } from '../hooks/usePermissions';
import { EditRegisterPermission } from '../components/EditRegisterPermission';
import { CreateEditRole } from '../components/CreateEditRole';
import { ManageRolePermissions } from '../components/ManageRolePermissions';
import type { PermissionAdmin } from '../interfaces/permission.interface';
import '../styles/CatalogPage.css';
import '../styles/PermissionsPage.css';

const APP_ACCESS_LABELS: Record<string, string> = {
    admin: 'Admin',
    booking: 'Booking',
    both: 'Ambas',
};

// Etiqueta legible del alcance de datos de cada rol (ver accessScope en el backend).
const SCOPE_LABELS: Record<number, string> = {
    1: 'Todo el sistema',
    2: 'Sus empresas',
    3: 'Sus sucursales',
    4: 'Sus sucursales',
};

type PageTab = 'permissions' | 'roles';

/**
 * Permisos y Roles del sistema, en una sola página con dos tabs:
 *  - Permisos: catálogo granular (key, módulo, grupo, acceso por app).
 *  - Roles: alta/edición/baja de roles + su plantilla de permisos — editarla cambia lo que
 *    reciben los usuarios nuevos; con "Aplicar a existentes" propaga el diff a los que ya
 *    tienen ese rol.
 */
const PermissionsPage = () => {
    const [tab, setTab] = useState<PageTab>('permissions');

    const {
        // Permisos
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        moduleFilter, setModuleFilter, moduleOptions,
        groupFilter, setGroupFilter, groupOptions,
        isPermissionModalOpen, permissionModalMode,
        permissionForm, setPermissionField, openPermissionCreate, openPermissionEdit, closePermissionModal, handlePermissionSubmit, isSavingPermission,
        deletingItem, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,

        // Roles
        roleItems, isRolesLoading,
        permissionCatalog,
        isRoleModalOpen, roleModalMode,
        roleForm, setRoleField, openRoleCreate, openRoleEdit, closeRoleModal, handleRoleSubmit, isSavingRole,
        deletingRole, isRoleDeleteOpen, openRoleDelete, closeRoleDelete, confirmRoleDelete, isDeletingRole,
        isManageRolePermissionsOpen, managingRole, assignedRoleKeys, syncRoleToUsers, setSyncRoleToUsers, isLoadingRolePermissions, isSavingRolePermissions,
        openManageRolePermissions, closeManageRolePermissions, toggleRolePermission, saveManageRolePermissions,
    } = usePermissions();

    const moduleSelectOptions = moduleOptions.map((module) => ({ value: module, label: module }));
    const groupSelectOptions = groupOptions.map((group) => ({ value: group, label: group }));

    const permissionColumns: TableColumn<PermissionAdmin>[] = [
        { key: 'key', header: 'Key', render: (row) => <span className="permission_key">{row.key}</span> },
        { key: 'label', header: 'Etiqueta' },
        { key: 'module', header: 'Módulo', render: (row) => <span className="permission_module_badge">{row.module}</span> },
        { key: 'groupName', header: 'Grupo', render: (row) => <span className="permission_module_badge">{row.groupName}</span> },
        { key: 'appAccess', header: 'Acceso', render: (row) => <span className={`app_access_badge app_access_badge_${row.appAccess}`}>{APP_ACCESS_LABELS[row.appAccess] ?? row.appAccess}</span> },
        { key: 'routesCount', header: 'Enpoints', render: (row) => <span className="references_badge">{row.routesCount}</span> },
        { key: 'referencesCount', header: 'Usuarios', render: (row) => <span className="references_badge">{row.referencesCount || '—'}</span> },
        { key: 'createdAt', header: 'Creado', render: (row) => formatDate(row.createdAt) },
        {
            key: 'actions', header: 'Acciones', render: (row) => (
                <TableActions actions={[
                    { label: 'Editar', icon: Pencil, variant: 'edit', onClick: () => openPermissionEdit(row) },
                    { label: 'Eliminar', icon: Trash2, variant: 'delete', onClick: () => openDelete(row) },
                ]} />
            )
        },
    ];

    const isPermissionsTab = tab === 'permissions';

    return (
        <div className="catalog_page">
            <Header
                title="Permisos y Roles"
                subtitle={isPermissionsTab ? 'Catálogo de permisos disponibles en el sistema' : 'Roles del sistema — permisos base y alcance de datos'}
                icon={isPermissionsTab ? ShieldCheck : ShieldUser}
                action={isPermissionsTab ? { label: 'Nuevo permiso', onClick: openPermissionCreate } : { label: 'Nuevo rol', onClick: openRoleCreate }}
            />

            <Tabs
                tabs={[
                    { key: 'permissions', label: 'Permisos', icon: ShieldCheck },
                    { key: 'roles', label: 'Roles', icon: ShieldUser },
                ]}
                activeKey={tab}
                onChange={(key) => setTab(key as PageTab)}
            />

            {isPermissionsTab ? (
                <>
                    <div className="catalog_toolbar">
                        <div className="catalog_toolbar_search">
                            <InputField
                                label="Buscar"
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Key o etiqueta..."
                                icon={Search}
                            />
                        </div>
                        <div className="catalog_toolbar_filter">
                            <SelectField
                                label="Módulo"
                                name="moduleFilter"
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(String(e.target.value))}
                                options={moduleSelectOptions}
                                showDefaultOption
                            />
                        </div>
                        <div className="catalog_toolbar_filter">
                            <SelectField
                                label="Grupo"
                                name="groupFilter"
                                value={groupFilter}
                                onChange={(e) => setGroupFilter(String(e.target.value))}
                                options={groupSelectOptions}
                                showDefaultOption
                            />
                        </div>
                    </div>
                    <Table
                        columns={permissionColumns}
                        data={items}
                        keyExtractor={(row) => row.id}
                        isLoading={isLoading}
                        emptyMessage="No hay permisos registrados"
                        pagination={pagination}
                        onPageChange={setPage}
                    />
                </>
            ) : isRolesLoading ? (
                <LoadingScreen message="Cargando roles..." />
            ) : roleItems.length === 0 ? (
                <EmptyScreen
                    message="Creá el primer rol para organizar permisos y alcances."
                    actionText="Nuevo rol"
                    onAction={openRoleCreate}
                />
            ) : (
                <div className="roles_cards_grid">
                    {roleItems.map((role) => (
                        <div key={role.id} className="role_card">
                            <div className="role_card_header">
                                <div className="role_card_icon"><ShieldUser size={22} /></div>
                                <div className="role_card_title">
                                    <h3>{role.label}</h3>
                                    <span className="permission_key">{role.key}</span>
                                </div>
                                <span className={`status_badge ${role.isActive ? 'active' : 'inactive'}`}>{role.isActive ? 'Activo' : 'Inactivo'}</span>
                            </div>

                            <div className="role_card_body">
                                <div className="role_card_row">
                                    <span className="role_card_row_label">Alcance</span>
                                    <span className="role_card_scope">{role.scopeLevel != null ? (SCOPE_LABELS[role.scopeLevel] ?? `Nivel ${role.scopeLevel}`) : 'No aplica'}</span>
                                </div>
                                <div className="role_card_row">
                                    <span className="role_card_row_label">Creado</span>
                                    <span>{formatDate(role.createdAt)}</span>
                                </div>
                            </div>

                            <div className="role_card_actions">
                                <Button text="Gestionar permisos" icon={ShieldCheck} size="sm" onClick={() => openManageRolePermissions(role)} />
                                <Button text="Editar" icon={Pencil} size="sm" color="secondary" onClick={() => openRoleEdit(role)} />
                                    <Button text="Eliminar" icon={Trash2} size="sm" color="danger" onClick={() => openRoleDelete(role)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <EditRegisterPermission
                isOpen={isPermissionModalOpen}
                onClose={closePermissionModal}
                onSubmit={handlePermissionSubmit}
                mode={permissionModalMode ?? 'create'}
                form={permissionForm}
                setField={setPermissionField}
                isSaving={isSavingPermission}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar permiso"
                description={`¿Seguro que deseas eliminar "${deletingItem?.label}"? Esta acción no se puede deshacer.`}
                variant="danger"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />

            <CreateEditRole
                isOpen={isRoleModalOpen}
                onClose={closeRoleModal}
                onSubmit={handleRoleSubmit}
                mode={roleModalMode ?? 'create'}
                roleKey={roleForm.key}
                onKeyChange={(value) => setRoleField('key')(value)}
                form={roleForm}
                setField={setRoleField}
                isSaving={isSavingRole}
            />
            <ManageRolePermissions
                isOpen={isManageRolePermissionsOpen}
                onClose={closeManageRolePermissions}
                roleLabel={managingRole?.label ?? ''}
                catalog={permissionCatalog}
                assignedKeys={assignedRoleKeys}
                onToggle={toggleRolePermission}
                syncToUsers={syncRoleToUsers}
                onSyncChange={setSyncRoleToUsers}
                onSave={saveManageRolePermissions}
                isLoading={isLoadingRolePermissions}
                isSaving={isSavingRolePermissions}
            />
            <Dialog
                isOpen={isRoleDeleteOpen}
                onClose={closeRoleDelete}
                title="Eliminar rol"
                description={`¿Seguro que deseas eliminar el rol "${deletingRole?.label}"? Esta acción no se puede deshacer.`}
                variant="danger"
                primaryAction={{ label: isDeletingRole ? 'Eliminando...' : 'Eliminar', onClick: confirmRoleDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeRoleDelete }}
            />
        </div>
    );
};

export default PermissionsPage;
