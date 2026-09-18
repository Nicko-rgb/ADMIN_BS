import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import CountryService from '../service/countryService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import { normalizeStr } from '../../../shared/utils/formatText';
import toast from '../../../shared/utils/toast';
import type { Country } from '../../../shared/interfaces/catalog.interface';
import type { CreateCountryPayload, UpdateCountryPayload } from '../interfaces/catalog.interface';
import type { CatalogFormField } from '../components/EditCatalogo';

type StatusFilter = 'all' | 'active' | 'inactive';

// Estado inicial del formulario de registro — is_active arranca en true, igual que el default del backend.
const EMPTY_CREATE_FORM: CreateCountryPayload = {
    country: '',
    iso_country: '',
    phone_code: '',
    iso_currency: '',
    currency: '',
    currency_simbol: '',
    time_zone: '',
    language: '',
    date_format: '',
    flag_url: '',
    is_active: true,
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (country: Country): Required<UpdateCountryPayload> => ({
    country: country.country,
    iso_country: country.isoCountry,
    phone_code: country.phoneCode,
    iso_currency: country.isoCurrency,
    currency: country.currency,
    currency_simbol: country.currencySimbol,
    time_zone: country.timeZone,
    language: country.language,
    date_format: country.dateFormat,
    flag_url: country.flagUrl,
    is_active: country.isActive,
});

/** Listado de países (búsqueda/filtro/paginación en el front) + edición: todo se maneja íntegramente acá. */
export const useCountries = () => {
    const [allItems, setAllItems] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdateCountryPayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateCountryPayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingCountry, setDeletingCountry] = useState<Country | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchCountries = async () => {
            try {
                const items = await CountryService.list();
                if (active) setAllItems(items);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchCountries();

        return () => { active = false; };
    }, [reloadToken]);

    const items = useMemo(() => {
        const term = normalizeStr(search);
        return allItems.filter((item) => {
            const matchesSearch = !term || normalizeStr(item.country).includes(term) || normalizeStr(item.isoCountry).includes(term) || normalizeStr(item.currency).includes(term);
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

    const openEdit = (country: Country) => {
        setEditingId(country.id);
        setForm(toEditForm(country));
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdateCountryPayload) => (value: string | number | boolean) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await CountryService.update(editingId, trimValues(form));
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

    const setCreateField = (name: keyof CreateCountryPayload) => (value: string | boolean) => {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        toast.loading('Registrando país...');
        try {
            const result = await CountryService.create(trimValues(createForm));
            toast.success(result.message);
            closeCreate();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreating(false);
        }
    };

    const openDelete = (country: Country) => setDeletingCountry(country);
    const closeDelete = () => setDeletingCountry(null);

    const confirmDelete = async () => {
        if (!deletingCountry) return;

        setIsDeleting(true);
        toast.loading('Eliminando país...');
        try {
            const result = await CountryService.delete(deletingCountry.id);
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
        { name: 'country', label: 'País', value: form.country, onChange: setField('country'), required: true, row: 1 },
        { name: 'iso_country', label: 'Código ISO', value: form.iso_country, onChange: setField('iso_country'), required: true, row: 1, mayus: true },
        { name: 'phone_code', label: 'Código telefónico', value: form.phone_code, onChange: setField('phone_code'), required: true, row: 1 },
        { name: 'iso_currency', label: 'Código de moneda', value: form.iso_currency, onChange: setField('iso_currency'), required: true, row: 2, mayus: true },
        { name: 'currency', label: 'Nombre de la moneda', value: form.currency, onChange: setField('currency'), required: true, row: 2 },
        { name: 'currency_simbol', label: 'Símbolo de moneda', value: form.currency_simbol, onChange: setField('currency_simbol'), required: true, row: 2 },
        { name: 'time_zone', label: 'Zona horaria', value: form.time_zone, onChange: setField('time_zone'), required: true, row: 3 },
        { name: 'language', label: 'Idioma', value: form.language, onChange: setField('language'), required: true, row: 3 },
        { name: 'date_format', label: 'Formato de fecha', value: form.date_format, onChange: setField('date_format'), required: true, row: 3 },
        { name: 'flag_url', label: 'URL de la bandera', value: form.flag_url, onChange: setField('flag_url'), required: true },
        { name: 'is_active', label: 'Activo', type: 'boolean', value: form.is_active, onChange: setField('is_active') },
    ] : [];

    return {
        items, isLoading,
        search, setSearch: handleSearchChange, statusFilter, setStatusFilter: handleStatusFilterChange,
        editingId, isEditOpen: editingId !== null, fields, openEdit, closeEdit, handleSubmit, isSaving,
        deletingCountry, isDeleteOpen: deletingCountry !== null, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    };
};
