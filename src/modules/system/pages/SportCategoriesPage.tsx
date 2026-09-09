import { Pencil, Search, Tags, Trash2 } from 'lucide-react';
import { Table, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { useSportCategories } from '../hooks/useSportCategories';
import { EditCatalogo } from '../components/EditCatalogo';
import { CreateSportCategory } from '../components/CreateSportCategory';
import type { SportCategory } from '../interfaces/catalog.interface';
import '../styles/CatalogPage.css';

// Listado, búsqueda, edición y eliminación de categorías deportivas.
const SportCategoriesPage = () => {
    const {
        items, isLoading,
        search, setSearch,
        openEdit, closeEdit, isEditOpen, fields, handleSubmit, isSaving,
        deletingSportCategory, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    } = useSportCategories();

    const columns: TableColumn<SportCategory>[] = [
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
            <Header title="Categorías" subtitle="Administra las categorías deportivas del sistema" icon={Tags} action={{ label: 'Nueva categoría', onClick: openCreate }} />
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
                emptyMessage="No hay categorías registradas"
            />
            <EditCatalogo
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                title="Editar categoría"
                icon={Tags}
                fields={fields}
                isSaving={isSaving}
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar categoría"
                description={`¿Seguro que deseas eliminar "${deletingSportCategory?.name}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
            <CreateSportCategory
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

export default SportCategoriesPage;
