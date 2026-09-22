import { Pencil, Search, ShieldCheck, UploadCloud, UserCog, Users as UsersIcon, X } from 'lucide-react';
import { Table, TableActions, TableImage } from '../../../shared/components/Table';
import type { TableAction, TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, FormActions, ForbiddenScreen, LoadingScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import useUsers from '../hooks/useUsers';
import { formatPhone } from '../../../shared/utils/formatText';
import { DOCUMENT_TYPE_LABELS, ROLE_MANAGE_PERMISSIONS, isManagedRole } from '../utils/userConstants';
import { FormUserManage } from '../components/FormUserManage';
import { ManageUserPermissions } from '../components/ManageUserPermissions';
import type { UserAdmin, DocumentType } from '../interfaces/user.interface';
import '../styles/UserPage.css';

// Listado, búsqueda, filtros (rol, país), edición y gestión de permisos de los usuarios del sistema.
const UserCatalog = () => {
    const can = usePermission();
    const {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        roleFilter, setRoleFilter, roleOptions, roleLabel,
        countryFilter, setCountryFilter, countryOptions,
        editing, editValues, isLoadingDetail, isSaving, isEditValid, openEdit, closeEdit, setEditField, handleSubmitEdit,
        canManagePermissions, permissionCatalog,
        isManagePermissionsOpen, managingUser, assignedKeys, isLoadingPermissions, isSavingPermissions,
        openManagePermissions, closeManagePermissions, togglePermission, saveManagePermissions,
    } = useUsers();

    // Editar exige el permiso de gestión del rol de esa fila.
    const rowActions = (row: UserAdmin): TableAction[] => {
        const actions: TableAction[] = [];
        if (isManagedRole(row.role) && can(ROLE_MANAGE_PERMISSIONS[row.role])) {
            actions.push({ label: 'Editar', icon: Pencil, variant: 'edit', onClick: () => openEdit(row) });
        }
        if (canManagePermissions) {
            actions.push({ label: 'Gestionar permisos', icon: ShieldCheck, variant: 'view', onClick: () => openManagePermissions(row) });
        }
        return actions;
    };

    const columns: TableColumn<UserAdmin>[] = [
        { key: 'name', header: 'Nombre' },
        { key: 'email', header: 'Correo', render: (row) => row.email ?? '—' },
        { key: 'phone', header: 'Teléfono', render: (row) => formatPhone(row.country?.phoneCode, row.phone) || '—' },
        {
            key: 'country', header: 'País', render: (row) => row.country ? (
                <div className="table_cell_media">
                    <TableImage src={row.country.flagUrl} alt={row.country.name} />
                    <span>{row.country.name}</span>
                </div>
            ) : '—'
        },
        {
            key: 'document', header: 'Documento', render: (row) => row.documentNumber
            ? `${DOCUMENT_TYPE_LABELS[row.documentType as DocumentType] ?? row.documentType} · ${row.documentNumber}`
            : '—'
        },
        { key: 'role', header: 'Rol', render: (row) => roleLabel(row.role) },
        { key: 'isEnabled', header: 'Estado', render: (row) => <span className={`status_badge ${row.isEnabled ? 'active' : 'inactive'}`}>{row.isEnabled ? 'Activo' : 'Inactivo'}</span> },
        {
            key: 'actions', header: 'Acciones', render: (row) => {
                const actions = rowActions(row);
                return actions.length > 0 ? <TableActions actions={actions} /> : '—';
            }
        },
    ];

    return (
        <div className="users_page">
            <Header title="Usuarios" subtitle="Usuarios registrados en el sistema" icon={UsersIcon} />
            <div className="users_toolbar">
                <div className="users_toolbar_search">
                    <InputField
                        label="Buscar"
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nombre o correo..."
                        icon={Search}
                    />
                </div>
                <div className="users_toolbar_filter">
                    <SelectField
                        label="Rol"
                        name="roleFilter"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(String(e.target.value))}
                        options={roleOptions}
                        showDefaultOption
                    />
                </div>
                <div className="users_toolbar_filter">
                    <SelectField
                        label="País"
                        name="countryFilter"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(String(e.target.value))}
                        options={countryOptions}
                        showDefaultOption
                    />
                </div>
            </div>
            <Table
                columns={columns}
                data={items}
                keyExtractor={(row) => row.publicId}
                isLoading={isLoading}
                emptyMessage="No hay usuarios registrados"
                pagination={pagination}
                onPageChange={setPage}
            />
            <Modal isOpen={editing !== null} onClose={closeEdit} title="Editar usuario" icon={UserCog} size="lg">
                {isLoadingDetail || !editing || !editValues ? (
                    <LoadingScreen message="Cargando datos del usuario..." size="sm" />
                ) : (
                    <form onSubmit={handleSubmitEdit}>
                        <FormUserManage role={editing.role} mode="edit" values={editValues} onChange={setEditField} />
                        <FormActions>
                            <Button text="Cancelar" icon={X} size="lg" color="secondary" type="button" onClick={closeEdit} />
                            <Button text="Guardar" icon={UploadCloud} size="lg" type="submit" loading={isSaving} disabled={!isEditValid} />
                        </FormActions>
                    </form>
                )}
            </Modal>
            {canManagePermissions && (
                <ManageUserPermissions
                    isOpen={isManagePermissionsOpen}
                    onClose={closeManagePermissions}
                    userName={managingUser?.name ?? ''}
                    catalog={permissionCatalog}
                    assignedKeys={assignedKeys}
                    onToggle={togglePermission}
                    onSave={saveManagePermissions}
                    isLoading={isLoadingPermissions}
                    isSaving={isSavingPermissions}
                />
            )}
        </div>
    );
};

// Catálogo global de usuarios — exclusivo de `user.manage_all` (mismo permiso que GET /users/manage).
const UserPage = () => {
    const can = usePermission();
    return can('user.manage_all') ? <UserCatalog /> : <ForbiddenScreen />;
};

export default UserPage;
