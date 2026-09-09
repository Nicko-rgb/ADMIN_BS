import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import SportCategoryService from '../service/sportCategoryService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import { normalizeStr } from '../../../shared/utils/formatText';
import toast from '../../../shared/utils/toast';
import type { CreateSportCategoryPayload, SportCategory, UpdateSportCategoryPayload } from '../interfaces/catalog.interface';
import type { CatalogFormField } from '../components/EditCatalogo';

const FETCH_LIMIT = 100; // catálogo pequeño — se trae completo una vez, sin paginación, y se busca en el front

// Estado inicial del formulario de registro.
const EMPTY_CREATE_FORM: CreateSportCategoryPayload = {
    code: '',
    name: '',
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (sportCategory: SportCategory): Required<UpdateSportCategoryPayload> => ({
    code: sportCategory.code,
    name: sportCategory.name,
});

/** Listado de categorías deportivas (búsqueda en el front — sin filtro de estado, el modelo no tiene is_active) + edición. */
export const useSportCategories = () => {
    const [allItems, setAllItems] = useState<SportCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdateSportCategoryPayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateSportCategoryPayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingSportCategory, setDeletingSportCategory] = useState<SportCategory | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchSportCategories = async () => {
            try {
                const res = await SportCategoryService.list(1, FETCH_LIMIT);
                if (active) setAllItems(res.data);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchSportCategories();

        return () => { active = false; };
    }, [reloadToken]);

    const items = useMemo(() => {
        const term = normalizeStr(search);
        if (!term) return allItems;
        return allItems.filter((item) => normalizeStr(item.code).includes(term) || normalizeStr(item.name).includes(term));
    }, [allItems, search]);

    const handleSearchChange = (value: string) => setSearch(value);

    const reload = () => {
        setIsLoading(true);
        setReloadToken((token) => token + 1);
    };

    const openEdit = (sportCategory: SportCategory) => {
        setEditingId(sportCategory.id);
        setForm(toEditForm(sportCategory));
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdateSportCategoryPayload) => (value: string | number | boolean) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await SportCategoryService.update(editingId, trimValues(form));
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

    const setCreateField = (name: keyof CreateSportCategoryPayload) => (value: string) => {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        toast.loading('Registrando categoría...');
        try {
            const result = await SportCategoryService.create(trimValues(createForm));
            toast.success(result.message);
            closeCreate();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreating(false);
        }
    };

    const openDelete = (sportCategory: SportCategory) => setDeletingSportCategory(sportCategory);
    const closeDelete = () => setDeletingSportCategory(null);

    const confirmDelete = async () => {
        if (!deletingSportCategory) return;

        setIsDeleting(true);
        toast.loading('Eliminando categoría...');
        try {
            const result = await SportCategoryService.delete(deletingSportCategory.id);
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
    ] : [];

    return {
        items, isLoading,
        search, setSearch: handleSearchChange,
        editingId, isEditOpen: editingId !== null, fields, openEdit, closeEdit, handleSubmit, isSaving,
        deletingSportCategory, isDeleteOpen: deletingSportCategory !== null, openDelete, closeDelete, confirmDelete, isDeleting,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
    };
};
