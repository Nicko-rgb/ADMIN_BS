import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import PermissionService from '../service/permissionService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import type { PaginationMeta } from '../../../shared/interfaces/pagination.interface';
import type { CreatePermissionPayload, PermissionAdmin, UpdatePermissionPayload } from '../interfaces/permission.interface';

const PAGE_LIMIT = 20; // igual al default de paginationQuerySchema en el backend
const SEARCH_DEBOUNCE_MS = 500;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 };

// Estado inicial del formulario de registro — app_access arranca igual que el default del backend.
const EMPTY_CREATE_FORM: CreatePermissionPayload = {
    key: '',
    label: '',
    description: null,
    module: '',
    app_access: 'admin',
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (item: PermissionAdmin): Required<UpdatePermissionPayload> => ({
    key: item.key,
    label: item.label,
    description: item.description,
    module: item.module,
    app_access: item.appAccess,
});

/**
 * Listado del catálogo de permisos — sin búsqueda, paginado en el backend; con búsqueda activa,
 * el backend filtra por key/label y devuelve todos los resultados sin paginar. Alta, edición y
 * baja se manejan íntegramente acá.
 */
export const usePermissions = () => {
    const [items, setItems] = useState<PermissionAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [moduleFilter, setModuleFilter] = useState('');
    const [moduleOptions, setModuleOptions] = useState<string[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdatePermissionPayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreatePermissionPayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingItem, setDeletingItem] = useState<PermissionAdmin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const setPage = (page: number) => setPagination((prev) => ({ ...prev, page }));

    // Debounce del término de búsqueda — evita un request por tecla.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [search]);

    // Toda búsqueda o filtro nuevo vuelve a la primera página.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, moduleFilter]);

    // Módulos distintos del catálogo, para el select de filtro — se cargan una sola vez.
    useEffect(() => {
        let active = true;

        PermissionService.listModules()
            .then((modules) => { if (active) setModuleOptions(modules); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchPermissions = async () => {
            setIsLoading(true);
            try {
                const res = await PermissionService.list(pagination.page, PAGE_LIMIT, debouncedSearch, moduleFilter);
                if (active) {
                    setItems(res.data);
                    setPagination(res.pagination);
                }
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchPermissions();

        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo pagination.page dispara refetch, no todo el objeto (cambiaría de referencia en cada setPagination)
    }, [pagination.page, debouncedSearch, moduleFilter, reloadToken]);

    const reload = () => setReloadToken((token) => token + 1);

    const openEdit = (item: PermissionAdmin) => {
        setEditingId(item.id);
        setForm(toEditForm(item));
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdatePermissionPayload) => (value: string | null) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await PermissionService.update(editingId, trimValues(form));
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

    const setCreateField = (name: keyof CreatePermissionPayload) => (value: string | null) => {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        toast.loading('Registrando permiso...');
        try {
            const result = await PermissionService.create(trimValues(createForm));
            toast.success(result.message);
            closeCreate();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreating(false);
        }
    };

    const openDelete = (item: PermissionAdmin) => setDeletingItem(item);
    const closeDelete = () => setDeletingItem(null);

    const confirmDelete = async () => {
        if (!deletingItem) return;

        setIsDeleting(true);
        toast.loading('Eliminando permiso...');
        try {
            const result = await PermissionService.delete(deletingItem.id);
            toast.success(result.message);
            closeDelete();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        moduleFilter, setModuleFilter, moduleOptions,
        isEditOpen: editingId !== null, form, setField, openEdit, closeEdit, handleSubmit, isSaving,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
        deletingItem, isDeleteOpen: deletingItem !== null, openDelete, closeDelete, confirmDelete, isDeleting,
    };
};
