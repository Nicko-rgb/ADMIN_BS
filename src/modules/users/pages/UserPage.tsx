import { Pencil, Search, ShieldCheck, Users as UsersIcon } from 'lucide-react';
import { Table, TableActions, TableImage } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { InputField, SelectField } from '../../../shared/components';
import useUsers from '../hooks/useUsers';
import { formatPhone } from '../../../shared/utils/formatText';
import { ROLE_LABELS, ROLE_OPTIONS, DOCUMENT_TYPE_LABELS } from '../utils/userConstants';
import { UserEdit } from '../components/UserEdit';
import { ManageUserPermissions } from '../components/ManageUserPermissions';
import type { UserAdmin, DocumentType } from '../interfaces/user.interface';
import '../styles/UserPage.css';

// Listado, búsqueda, filtros (rol, país), edición y gestión de permisos de los usuarios del sistema.
const UserPage = () => {
    const {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        roleFilter, setRoleFilter,
        countryFilter, setCountryFilter, countryOptions,
        isEditOpen, form, isLoadingDetail, openEdit, closeEdit, setField, handleSubmit, isSaving,
        permissionCatalog,
        isManagePermissionsOpen, managingUser, assignedKeys, isLoadingPermissions, isSavingPermissions,
        openManagePermissions, closeManagePermissions, togglePermission, saveManagePermissions,
    } = useUsers();

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
        { key: 'role', header: 'Rol', render: (row) => ROLE_LABELS[row.role] ?? row.role },
        { key: 'isEnabled', header: 'Estado', render: (row) => <span className={`status_badge ${row.isEnabled ? 'active' : 'inactive'}`}>{row.isEnabled ? 'Activo' : 'Inactivo'}</span> },
        {
            key: 'document', header: 'Documento', render: (row) => row.documentNumber
                ? `${DOCUMENT_TYPE_LABELS[row.documentType as DocumentType] ?? row.documentType} · ${row.documentNumber}`
                : '—'
        },
        {
            key: 'actions', header: 'Acciones', render: (row) => (
                <TableActions actions={[
                    { label: 'Editar', icon: Pencil, variant: 'edit', onClick: () => openEdit(row.id) },
                    { label: 'Gestionar permisos', icon: ShieldCheck, variant: 'view', onClick: () => openManagePermissions(row) },
                ]} />
            )
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
                        options={ROLE_OPTIONS}
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
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No hay usuarios registrados"
                pagination={pagination}
                onPageChange={setPage}
            />
            <UserEdit
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                form={form}
                isLoadingDetail={isLoadingDetail}
                setField={setField}
                isSaving={isSaving}
                countryOptions={countryOptions}
            />
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
        </div>
    );
};

export default UserPage;
