import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import PaymentTypeService from '../service/paymentTypeService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import { normalizeStr } from '../../../shared/utils/formatText';
import toast from '../../../shared/utils/toast';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import type { CreatePaymentTypePayload, PaymentType, UpdatePaymentTypePayload } from '../interfaces/catalog.interface';
import type { CatalogFormField } from '../components/EditCatalogo';

const FETCH_LIMIT = 100; // catálogo pequeño — se trae completo una vez, sin paginación, y se busca/filtra en el front

type StatusFilter = 'all' | 'active' | 'inactive';

export const CATEGORY_OPTIONS = [
    { value: 'tarjeta_credito', label: 'Tarjeta de crédito' },
    { value: 'tarjeta_debito', label: 'Tarjeta de débito' },
    { value: 'transferencia_bancaria', label: 'Transferencia bancaria' },
    { value: 'billetera_digital', label: 'Billetera digital' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'criptomoneda', label: 'Criptomoneda' },
];

// Estado inicial del formulario de registro — is_enabled arranca en true, igual que el default del backend.
// country_id arranca en 0 (sin selección): ningún país real tiene ese id, así el select lo muestra vacío.
const EMPTY_CREATE_FORM: CreatePaymentTypePayload = {
    country_id: 0,
    name: '',
    code: '',
    category: '',
    provider: null,
    description: null,
    icon_url: null,
    is_enabled: true,
    processing_time: null,
    commission_percentage: null,
    fixed_commission: null,
    min_amount: null,
    max_amount: null,
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (paymentType: PaymentType): Required<UpdatePaymentTypePayload> => ({
    country_id: paymentType.countryId,
    name: paymentType.name,
    code: paymentType.code,
    category: paymentType.category,
    provider: paymentType.provider,
    description: paymentType.description,
    icon_url: paymentType.iconUrl,
    is_enabled: paymentType.isActive,
    processing_time: paymentType.processingTime,
    commission_percentage: paymentType.commissionPercentage,
    fixed_commission: paymentType.fixedCommission,
    min_amount: paymentType.minAmount,
    max_amount: paymentType.maxAmount,
});

/** Listado de tipos de pago (búsqueda/filtro/paginación en el front) + edición: todo se maneja íntegramente acá. */
export const usePaymentTypes = () => {
    const { countries } = useCatalogActive();
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    const [allItems, setAllItems] = useState<PaymentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdatePaymentTypePayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreatePaymentTypePayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingPaymentType, setDeletingPaymentType] = useState<PaymentType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchPaymentTypes = async () => {
            try {
                const res = await PaymentTypeService.list(1, FETCH_LIMIT);
                if (active) setAllItems(res.data);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchPaymentTypes();

        return () => { active = false; };
    }, [reloadToken]);

    const items = useMemo(() => {
        const term = normalizeStr(search);
        return allItems.filter((item) => {
            const matchesSearch = !term
                || normalizeStr(item.name).includes(term)
                || normalizeStr(item.code).includes(term)
                || normalizeStr(item.provider).includes(term)
                || normalizeStr(item.category).includes(term);
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [allItems, search, statusFilter]);

    const handleSearchChange = (value: string) => setSearch(value);
    const handleStatusFilterChange = (value: StatusFilter) => setStatusFilter(value);

    const reload = () => {
        setIsLoading(true);
        setReloadToken((token) => token + 1);
    };

    const openEdit = (paymentType: PaymentType) => {
        setEditingId(paymentType.id);
        setForm(toEditForm(paymentType));
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdatePaymentTypePayload) => (value: string | number | boolean) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await PaymentTypeService.update(editingId, trimValues(form));
            toast.success(result.message);
            closeEdit();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const openCreate = () => {
        setCreateForm(EMPTY_CREATE_FORM);
        setIsCreateOpen(true);
    };

    const closeCreate = () => setIsCreateOpen(false);

    const setCreateField = (name: keyof CreatePaymentTypePayload) => (value: string | number | boolean | null) => {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        toast.loading('Registrando tipo de pago...');
        try {
            const result = await PaymentTypeService.create(trimValues(createForm));
            toast.success(result.message);
            closeCreate();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreating(false);
        }
    };

    const openDelete = (paymentType: PaymentType) => setDeletingPaymentType(paymentType);
    const closeDelete = () => setDeletingPaymentType(null);

    const confirmDelete = async () => {
        if (!deletingPaymentType) return;

        setIsDeleting(true);
        toast.loading('Eliminando tipo de pago...');
        try {
            const result = await PaymentTypeService.delete(deletingPaymentType.id);
            toast.success(result.message);
            closeDelete();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeleting(false);
        }
    };

    // Arma la config de campos que consume EditCatalogo — solo se calcula si hay un form abierto.
    const fields: CatalogFormField[] = form ? [
        { name: 'name', label: 'Nombre', value: form.name, onChange: setField('name'), required: true, row: 1 },
        { name: 'code', label: 'Código', value: form.code, onChange: setField('code'), required: true, row: 1, mayus: true },
        { name: 'country_id', label: 'País', type: 'select', value: form.country_id, onChange: setField('country_id'), options: countryOptions, required: true, row: 1 },
        { name: 'category', label: 'Categoría', type: 'select', value: form.category, onChange: setField('category'), options: CATEGORY_OPTIONS, required: true, row: 2 },
        { name: 'provider', label: 'Proveedor', value: form.provider, onChange: setField('provider'), row: 2 },
        { name: 'icon_url', label: 'URL del ícono', placeholder: 'https://icon.img', value: form.icon_url, onChange: setField('icon_url'), row: 3 },
        { name: 'processing_time', label: 'Tiempo de procesamiento', value: form.processing_time, onChange: setField('processing_time'), row: 3 },
        { name: 'commission_percentage', label: 'Comisión %', value: form.commission_percentage, onChange: setField('commission_percentage'), row: 4, numberOnly: true },
        { name: 'fixed_commission', label: 'Comisión fija', value: form.fixed_commission, onChange: setField('fixed_commission'), row: 4, numberOnly: true },
        { name: 'min_amount', label: 'Monto mínimo', value: form.min_amount, onChange: setField('min_amount'), row: 4, numberOnly: true },
        { name: 'max_amount', label: 'Monto máximo', value: form.max_amount, onChange: setField('max_amount'), row: 4, numberOnly: true },
        { name: 'description', label: 'Descripción', type: 'textarea', value: form.description, onChange: setField('description') },
        { name: 'is_enabled', label: 'Habilitado', type: 'boolean', value: form.is_enabled, onChange: setField('is_enabled') },
    ] : [];

    return {
        items, isLoading,
        search, setSearch: handleSearchChange, statusFilter, setStatusFilter: handleStatusFilterChange,
        editingId, isEditOpen: editingId !== null, fields, openEdit, closeEdit, handleSubmit, isSaving,
        deletingPaymentType, isDeleteOpen: deletingPaymentType !== null, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating, countryOptions,
    };
};
