import { Grid3x3, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { useSurfaceTypes } from '../hooks/useSurfaceTypes';
import { EditCatalogo } from '../components/EditCatalogo';
import { CreateSurfaceType } from '../components/CreateSurfaceType';
import type { SurfaceType } from '../../../shared/interfaces/catalog.interface';
import '../styles/CatalogPage.css';

// Listado, búsqueda, edición y eliminación de tipos de superficie.
const SurfaceTypesPage = () => {
    const {
        items, isLoading,
        search, setSearch,
        openEdit, closeEdit, isEditOpen, fields, handleSubmit, isSaving,
        deletingSurfaceType, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    } = useSurfaceTypes();

    const columns: TableColumn<SurfaceType>[] = [
        { key: 'code', header: 'Código' },
        { key: 'name', header: 'Nombre' },
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
            <Header title="Superficies" subtitle="Administra los tipos de superficie del sistema" icon={Grid3x3} action={{ label: 'Nueva superficie', onClick: openCreate }} />
            <div className="catalog_toolbar">
                <div className="catalog_toolbar_search">
                    <InputField
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Código o nombre..."
                        icon={Search}
                    />
                </div>
            </div>
            <Table
                columns={columns}
                data={items}
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="No hay superficies registradas"
            />
            <EditCatalogo
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                title="Editar superficie"
                icon={Grid3x3}
                fields={fields}
                isSaving={isSaving}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar superficie"
                description={`¿Seguro que deseas eliminar "${deletingSurfaceType?.name}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
            <CreateSurfaceType
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

export default SurfaceTypesPage;
