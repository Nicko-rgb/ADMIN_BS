import { Pencil, Search, Trash2, Trophy } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField, SelectField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { useSportTypes } from '../hooks/useSportTypes';
import { EditCatalogo } from '../components/EditCatalogo';
import { CreateSportType } from '../components/CreateSportType';
import type { SportType } from '../interfaces/catalog.interface';
import '../styles/CatalogPage.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
];

// Listado, búsqueda, filtro, edición y eliminación de tipos de deporte.
const SportTypesPage = () => {
    const {
        items, isLoading,
        search, setSearch, statusFilter, setStatusFilter,
        openEdit, closeEdit, isEditOpen, fields, handleSubmit, isSaving,
        deletingSportType, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    } = useSportTypes();

    const columns: TableColumn<SportType>[] = [
        { key: 'code', header: 'Código' },
        { key: 'name', header: 'Nombre' },
        { key: 'isActive', header: 'Estado', render: (row) => <span className={`status_badge ${row.isActive ? 'active' : 'inactive'}`}>{row.isActive ? 'Activo' : 'Inactivo'}</span> },
        { key: 'referencesCount', header: 'Referencias', render: (row) => <span className="references_badge">{row.referencesCount}</span> },
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
            <Header title="Deportes" subtitle="Administra los tipos de deporte del sistema" icon={Trophy} action={{ label: 'Nuevo deporte', onClick: openCreate }} />
            <div className="catalog_toolbar">
                <div className="catalog_toolbar_search">
                    <InputField
                        label='Buscar'
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Código o nombre..."
                        icon={Search}
                    />
                </div>
                <div className="catalog_toolbar_filter">
                    <SelectField
                        label='Estado'
                        name="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        options={STATUS_OPTIONS}
                    />
                </div>
            </div>
            <Table
                columns={columns}
                data={items}
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No hay deportes registrados"
            />
            <EditCatalogo
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                title="Editar deporte"
                icon={Trophy}
                fields={fields}
                isSaving={isSaving}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar deporte"
                description={`¿Seguro que deseas eliminar "${deletingSportType?.name}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
            <CreateSportType
                isOpen={isCreateOpen}
                onClose={closeCreate}
                onSubmit={handleCreateSubmit}
                form={createForm}
                setField={setCreateField}
                isSaving={isCreating}
            />
        </div>
    );
};

export default SportTypesPage;
