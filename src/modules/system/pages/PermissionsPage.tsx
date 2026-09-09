import { Pencil, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField, SelectField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { usePermissions } from '../hooks/usePermissions';
import { EditRegisterPermission } from '../components/EditRegisterPermission';
import type { PermissionAdmin } from '../interfaces/permission.interface';
import '../styles/CatalogPage.css';
import '../styles/PermissionsPage.css';

const APP_ACCESS_LABELS: Record<string, string> = {
    admin: 'Admin',
    booking: 'Booking',
    both: 'Ambas',
};

// Listado, búsqueda, alta, edición y eliminación de permisos del catálogo del sistema.
const PermissionsPage = () => {
    const {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        moduleFilter, setModuleFilter, moduleOptions,
        openEdit, closeEdit, isEditOpen, form, setField, handleSubmit, isSaving,
        openCreate, closeCreate, isCreateOpen, createForm, setCreateField, handleCreateSubmit, isCreating,
        deletingItem, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
    } = usePermissions();

    const moduleSelectOptions = moduleOptions.map((module) => ({ value: module, label: module }));

    const columns: TableColumn<PermissionAdmin>[] = [
        { key: 'key', header: 'Key', render: (row) => <span className="permission_key">{row.key}</span> },
        { key: 'label', header: 'Etiqueta' },
        { key: 'module', header: 'Módulo', render: (row) => <span className="permission_module_badge">{row.module}</span> },
        { key: 'appAccess', header: 'Acceso', render: (row) => <span className={`app_access_badge app_access_badge_${row.appAccess}`}>{APP_ACCESS_LABELS[row.appAccess] ?? row.appAccess}</span> },
        { key: 'routesCount', header: 'Enpoints', render: (row) => <span className="references_badge">{row.routesCount}</span> },
        { key: 'referencesCount', header: 'Usuarios', render: (row) => <span className="references_badge">{row.referencesCount || '—'}</span> },
        { key: 'description', header: 'Descripción', render: (row) => row.description ?? '—' },
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

    return (
        <div className="catalog_page">
            <Header title="Permisos" subtitle="Catálogo de permisos disponibles en el sistema" icon={ShieldCheck} action={{ label: 'Nuevo permiso', onClick: openCreate }} />
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
            </div>
            <Table
                columns={columns}
                data={items}
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No hay permisos registrados"
                pagination={pagination}
                onPageChange={setPage}
            />
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
        </div>
    );
};

export default PermissionsPage;
