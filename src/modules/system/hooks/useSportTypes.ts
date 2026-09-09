import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import SportTypeService from '../service/sportTypeService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import { normalizeStr } from '../../../shared/utils/formatText';
import toast from '../../../shared/utils/toast';
import type { CreateSportTypePayload, SportType, UpdateSportTypePayload } from '../interfaces/catalog.interface';
import type { CatalogFormField } from '../components/EditCatalogo';

const FETCH_LIMIT = 100; // catálogo pequeño — se trae completo una vez, sin paginación, y se busca/filtra en el front

type StatusFilter = 'all' | 'active' | 'inactive';

// Estado inicial del formulario de registro — is_active arranca en true, igual que el default del backend.
const EMPTY_CREATE_FORM: CreateSportTypePayload = {
    code: '',
    name: '',
    is_active: true,
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (sportType: SportType): Required<UpdateSportTypePayload> => ({
    code: sportType.code,
    name: sportType.name,
    is_active: sportType.isActive,
});

/** Listado de tipos de deporte (búsqueda/filtro/paginación en el front) + edición: todo se maneja íntegramente acá. */
export const useSportTypes = () => {
    const [allItems, setAllItems] = useState<SportType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdateSportTypePayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateSportTypePayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingSportType, setDeletingSportType] = useState<SportType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchSportTypes = async () => {
            try {
                const res = await SportTypeService.list(1, FETCH_LIMIT);
                if (active) setAllItems(res.data);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchSportTypes();

        return () => { active = false; };
    }, [reloadToken]);

    const items = useMemo(() => {
        const term = normalizeStr(search);
        return allItems.filter((item) => {
            const matchesSearch = !term || normalizeStr(item.code).includes(term) || normalizeStr(item.name).includes(term);
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

    const openEdit = (sportType: SportType) => {
        setEditingId(sportType.id);
        setForm(toEditForm(sportType));
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdateSportTypePayload) => (value: string | number | boolean) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await SportTypeService.update(editingId, trimValues(form));
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

    const setCreateField = (name: keyof CreateSportTypePayload) => (value: string | boolean) => {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        toast.loading('Registrando deporte...');
        try {
            const result = await SportTypeService.create(trimValues(createForm));
            toast.success(result.message);
            closeCreate();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreating(false);
        }
    };

    const openDelete = (sportType: SportType) => setDeletingSportType(sportType);
    const closeDelete = () => setDeletingSportType(null);

    const confirmDelete = async () => {
        if (!deletingSportType) return;

        setIsDeleting(true);
        toast.loading('Eliminando deporte...');
        try {
            const result = await SportTypeService.delete(deletingSportType.id);
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
        { name: 'code', label: 'Código', value: form.code, onChange: setField('code'), required: true, row: 1, mayus: true },
        { name: 'name', label: 'Nombre', value: form.name, onChange: setField('name'), required: true, row: 1 },
        { name: 'is_active', label: 'Activo', type: 'boolean', value: form.is_active, onChange: setField('is_active') },
    ] : [];

    return {
        items, isLoading,
        search, setSearch: handleSearchChange, statusFilter, setStatusFilter: handleStatusFilterChange,
        editingId, isEditOpen: editingId !== null, fields, openEdit, closeEdit, handleSubmit, isSaving,
        deletingSportType, isDeleteOpen: deletingSportType !== null, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    };
};
