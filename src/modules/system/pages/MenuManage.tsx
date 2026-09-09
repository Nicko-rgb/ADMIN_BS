import { LayoutGrid, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { useMenuItems } from '../hooks/useMenuItems';
import { CreateEditMenuItem } from '../components/CreateEditMenuItem';
import type { MenuItemAdmin } from '../interfaces/menu.interface';
import '../styles/CatalogPage.css';

const APP_ACCESS_LABELS: Record<string, string> = {
    admin: 'Admin',
    booking: 'Booking',
    both: 'Ambas',
};

// Listado, búsqueda, alta, edición y eliminación de ítems de menú (catálogo que arma el sidebar dinámico).
const MenuManage = () => {
    const {
        items, isLoading,
        search, setSearch,
        parentOptions, searchPermissionOptions,
        openEdit, closeEdit, isEditOpen, form, setField, handleSubmit, isSaving,
        openCreate, closeCreate, isCreateOpen, createForm, setCreateField, handleCreateSubmit, isCreating,
        deletingItem, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
    } = useMenuItems();

    const columns: TableColumn<MenuItemAdmin>[] = [
        { key: 'key', header: 'Key' },
        { key: 'label', header: 'Etiqueta' },
        { key: 'path', header: 'Ruta' },
        { key: 'groupTitle', header: 'Grupo', render: (row) => row.groupTitle ?? '—' },
        { key: 'parentKey', header: 'Padre', render: (row) => row.parentKey ?? '—' },
        { key: 'appAccess', header: 'Acceso', render: (row) => <span className={`app_access_badge app_access_badge_${row.appAccess}`}>{APP_ACCESS_LABELS[row.appAccess] ?? row.appAccess}</span> },
        { key: 'requiredPermission', header: 'Permiso Req', render: (row) => row.requiredPermission ?? '—'},
        { key: 'sortOrder', header: 'Orden' },
        { key: 'isActive', header: 'Estado', render: (row) => <span className={`status_badge ${row.isActive ? 'active' : 'inactive'}`}>{row.isActive ? 'Activo' : 'Inactivo'}</span> },
        { key: 'childrenCount', header: 'Hijos', render: (row) => <span className="references_badge">{row.childrenCount}</span> },
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
            <Header title="Menú" subtitle="Administra los ítems del menú de navegación" icon={LayoutGrid} action={{ label: 'Nuevo ítem', onClick: openCreate }} />
            <div className="catalog_toolbar">
                <div className="catalog_toolbar_search">
                    <InputField
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Key, etiqueta o grupo..."
                        icon={Search}
                    />
                </div>
            </div>
            <Table
                columns={columns}
                data={items}
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No hay ítems de menú registrados"
            />
            <CreateEditMenuItem
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                mode="edit"
                form={form ?? createForm}
                setField={setField}
                parentOptions={parentOptions}
                searchPermissionOptions={searchPermissionOptions}
                isSaving={isSaving}
            />
            <CreateEditMenuItem
                isOpen={isCreateOpen}
                onClose={closeCreate}
                onSubmit={handleCreateSubmit}
                mode="create"
                form={createForm}
                setField={setCreateField}
                parentOptions={parentOptions}
                searchPermissionOptions={searchPermissionOptions}
                isSaving={isCreating}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar ítem de menú"
                description={`¿Seguro que deseas eliminar "${deletingItem?.label}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
        </div>
    );
};

export default MenuManage;
