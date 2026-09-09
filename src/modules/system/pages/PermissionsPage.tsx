import { useState } from 'react';
import { Pencil, Search, ShieldCheck, ShieldUser, Trash2 } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn, TableAction } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField, SelectField, Tabs } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { usePermissions } from '../hooks/usePermissions';
import { EditRegisterPermission } from '../components/EditRegisterPermission';
import { CreateEditRole } from '../components/CreateEditRole';
import { ManageRolePermissions } from '../components/ManageRolePermissions';
import type { PermissionAdmin } from '../interfaces/permission.interface';
import type { RoleAdmin } from '../interfaces/role.interface';
import '../styles/CatalogPage.css';
import '../styles/PermissionsPage.css';

const APP_ACCESS_LABELS: Record<string, string> = {
    admin: 'Admin',
    booking: 'Booking',
    both: 'Ambas',
};

// Los 5 roles sembrados de base — el resto del sistema los referencia por key (login bloquea
// 'cliente', bootstrap busca 'system'...), así que ni el backend ni acá dejan borrarlos. Mismo
// criterio que role.service.ts::RESERVED_ROLE_KEYS, solo para no ofrecer una acción que el
// backend va a rechazar igual.
const RESERVED_ROLE_KEYS = ['cliente', 'empleado', 'administrador', 'super_admin', 'system'];

type PageTab = 'permissions' | 'roles';

/**
 * Permisos y Roles del sistema, en una sola página con dos tabs:
 *  - Permisos: catálogo granular (key, módulo, grupo, acceso por app).
 *  - Roles: alta/edición/baja de roles + sus permisos base — editar acá los permisos de un rol
 *    se los da (o quita) de una sola vez a todos los usuarios que lo tienen, sin ir uno por uno.
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
        isEditOpen, form, setField, openEdit, closeEdit, handleSubmit, isSaving,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
        deletingItem, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,

        // Roles
        roleItems, isRolesLoading,
        permissionCatalog,
        isRoleEditOpen, editingRole, roleForm, setRoleField, openRoleEdit, closeRoleEdit, handleRoleSubmit, isSavingRole,
        isRoleCreateOpen, roleCreateForm, openRoleCreate, closeRoleCreate, setRoleCreateField, handleRoleCreateSubmit, isCreatingRole,
        deletingRole, isRoleDeleteOpen, openRoleDelete, closeRoleDelete, confirmRoleDelete, isDeletingRole,
        isManageRolePermissionsOpen, managingRole, assignedRoleKeys, isLoadingRolePermissions, isSavingRolePermissions,
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
                    { label: 'Editar', icon: Pencil, variant: 'edit', onClick: () => openEdit(row) },
                    { label: 'Eliminar', icon: Trash2, variant: 'delete', onClick: () => openDelete(row) },
                ]} />
            )
        },
    ];

    const roleColumns: TableColumn<RoleAdmin>[] = [
        { key: 'key', header: 'Key' },
        { key: 'label', header: 'Etiqueta' },
        { key: 'scopeLevel', header: 'Alcance', render: (row) => row.scopeLevel ?? '—' },
        { key: 'isActive', header: 'Estado', render: (row) => <span className={`status_badge ${row.isActive ? 'active' : 'inactive'}`}>{row.isActive ? 'Activo' : 'Inactivo'}</span> },
        { key: 'createdAt', header: 'Creado', render: (row) => formatDate(row.createdAt) },
        {
            key: 'actions', header: 'Acciones', render: (row) => {
                const actions: TableAction[] = [
                    { label: 'Editar', icon: Pencil, variant: 'edit', onClick: () => openRoleEdit(row) },
                    { label: 'Gestionar permisos', icon: ShieldCheck, variant: 'view', onClick: () => openManageRolePermissions(row) },
                ];
                if (!RESERVED_ROLE_KEYS.includes(row.key)) {
                    actions.push({ label: 'Eliminar', icon: Trash2, variant: 'delete', onClick: () => openRoleDelete(row) });
                }
                return <TableActions actions={actions} />;
            }
        },
    ];

    const isPermissionsTab = tab === 'permissions';

    return (
        <div className="catalog_page">
            <Header
                title="Permisos y Roles"
                subtitle={isPermissionsTab ? 'Catálogo de permisos disponibles en el sistema' : 'Roles del sistema — permisos base y alcance de datos'}
                icon={isPermissionsTab ? ShieldCheck : ShieldUser}
                action={isPermissionsTab ? { label: 'Nuevo permiso', onClick: openCreate } : { label: 'Nuevo rol', onClick: openRoleCreate }}
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
            ) : (
                <Table
                    columns={roleColumns}
                    data={roleItems}
                    keyExtractor={(row) => row.id}
                    isLoading={isRolesLoading}
                    emptyMessage="No hay roles registrados"
                />
            )}

            <EditRegisterPermission
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                mode="edit"
                form={form ?? createForm}
                setField={setField}
                isSaving={isSaving}
            />
            <EditRegisterPermission
                isOpen={isCreateOpen}
                onClose={closeCreate}
                onSubmit={handleCreateSubmit}
                mode="create"
                form={createForm}
                setField={setCreateField}
                isSaving={isCreating}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar permiso"
                description={`¿Seguro que deseas eliminar "${deletingItem?.label}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />

            <CreateEditRole
                isOpen={isRoleEditOpen}
                onClose={closeRoleEdit}
                onSubmit={handleRoleSubmit}
                mode="edit"
                roleKey={editingRole?.key ?? ''}
                onKeyChange={() => {}}
                form={roleForm ?? roleCreateForm}
                setField={setRoleField}
                isSaving={isSavingRole}
            />
            <CreateEditRole
                isOpen={isRoleCreateOpen}
                onClose={closeRoleCreate}
                onSubmit={handleRoleCreateSubmit}
                mode="create"
                roleKey={roleCreateForm.key}
                onKeyChange={setRoleCreateField('key')}
                form={roleCreateForm}
                setField={setRoleCreateField}
                isSaving={isCreatingRole}
            />
            <ManageRolePermissions
                isOpen={isManageRolePermissionsOpen}
                onClose={closeManageRolePermissions}
                roleLabel={managingRole?.label ?? ''}
                catalog={permissionCatalog}
                assignedKeys={assignedRoleKeys}
                onToggle={toggleRolePermission}
                onSave={saveManageRolePermissions}
                isLoading={isLoadingRolePermissions}
                isSaving={isSavingRolePermissions}
            />
            <Dialog
                isOpen={isRoleDeleteOpen}
                onClose={closeRoleDelete}
                title="Eliminar rol"
                description={`¿Seguro que deseas eliminar el rol "${deletingRole?.label}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeletingRole ? 'Eliminando...' : 'Eliminar', onClick: confirmRoleDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeRoleDelete }}
            />
        </div>
    );
};

export default PermissionsPage;
