import { CreditCard, Pencil, Search, Trash2 } from 'lucide-react';
import { Table, TableImage, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { InputField, SelectField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { usePaymentTypes } from '../hooks/usePaymentTypes';
import { EditCatalogo } from '../components/EditCatalogo';
import { CreatePaymentType } from '../components/CreatePaymentType';
import type { PaymentType } from '../interfaces/catalog.interface';
import '../styles/CatalogPage.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
];

// Listado, búsqueda, filtro, edición y eliminación de tipos de pago.
const PaymentTypesPage = () => {
    const {
        items, isLoading,
        search, setSearch, statusFilter, setStatusFilter,
        openEdit, closeEdit, isEditOpen, fields, handleSubmit, isSaving,
        deletingPaymentType, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating, countryOptions,
    } = usePaymentTypes();

    const columns: TableColumn<PaymentType>[] = [
        {
            key: 'name', header: 'Nombre', render: (row) => (
                <div className="table_cell_media">
                    <TableImage src={row.iconUrl} alt={row.name} />
                    <span>{row.name}</span>
                </div>
            )
        },
        { key: 'code', header: 'Código' },
        { key: 'countryName', header: 'País', render: (row) => row.countryName ?? '—' },
        { key: 'category', header: 'Categoría' },
        { key: 'provider', header: 'Proveedor', render: (row) => row.provider ?? '—' },
        { key: 'commissionPercentage', header: 'Comisión', render: (row) => ( `${(Number(row.commissionPercentage) * 100).toFixed(2)}% + ${row.fixedCommission}`)},
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
            <Header title="Tipos de pago" subtitle="Administra los tipos de pago disponibles en el sistema" icon={CreditCard} action={{ label: 'Nuevo tipo de pago', onClick: openCreate }} />
            <div className="catalog_toolbar">
                <div className="catalog_toolbar_search">
                    <InputField
                        label='Buscar'
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nombre, código, proveedor o categoría..."
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
                emptyMessage="No hay tipos de pago registrados"
            />
            <EditCatalogo
                isOpen={isEditOpen}
                onClose={closeEdit}
                onSubmit={handleSubmit}
                title="Editar tipo de pago"
                icon={CreditCard}
                fields={fields}
                isSaving={isSaving}
                size='lg'
            />
            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar tipo de pago"
                description={`¿Seguro que deseas eliminar "${deletingPaymentType?.name}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
            <CreatePaymentType
                isOpen={isCreateOpen}
                onClose={closeCreate}
                onSubmit={handleCreateSubmit}
                form={createForm}
                setField={setCreateField}
                countryOptions={countryOptions}
                isSaving={isCreating}
            />
        </div>
    );
};

export default PaymentTypesPage;
