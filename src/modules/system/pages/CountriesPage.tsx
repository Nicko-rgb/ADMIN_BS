import '../styles/CatalogPage.css';
import { Globe, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableImage, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField, SelectField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { useCountries } from '../hooks/useCountries';
import { EditCatalogo } from '../components/EditCatalogo';
import { CreateCountry } from '../components/CreateCountry';
import type { Country } from '../interfaces/catalog.interface';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
];

// Listado, búsqueda, filtro, edición y eliminación de países.
const CountriesPage = () => {
    const {
        items, isLoading,
        search, setSearch, statusFilter, setStatusFilter,
        openEdit, closeEdit, isEditOpen, fields, handleSubmit, isSaving,
        deletingCountry, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    } = useCountries();

    const columns: TableColumn<Country>[] = [
        {
            key: 'country', header: 'País', render: (row) => (
                <div className="table_cell_media">
                    <TableImage src={row.flagUrl} alt={row.country} />
                    <span>{row.country}</span>
                </div>
            )
        },
        { key: 'isoCountry', header: 'ISO' },
        { key: 'phoneCode', header: 'Código' },
        { key: 'currency', header: 'Moneda', render: (row) => `${row.currency} - ${row.currencySimbol}` },
        { key: 'isoCurrency', header: 'ISO Moneda'},
        { key: 'timeZone', header: 'Zona Horaria'},
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
            <Header title="Países" subtitle="Administra los países disponibles en el sistema" icon={Globe} action={{ label: 'Nuevo país', onClick: openCreate }} />
            <div className="catalog_toolbar">
                <div className="catalog_toolbar_search">
                    <InputField
                        label='Buscar'
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nombre, ISO o moneda..."
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
                emptyMessage="No hay países registrados"
            />
            <EditCatalogo
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                title="Editar país"
                icon={Globe}
                fields={fields}
                isSaving={isSaving}
                size='lg'
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar país"
                description={`¿Seguro que deseas eliminar "${deletingCountry?.country}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />

            <CreateCountry
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

export default CountriesPage;
