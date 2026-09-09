import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import MenuService from '../service/menuService';
import PermissionService from '../service/permissionService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import { normalizeStr } from '../../../shared/utils/formatText';
import toast from '../../../shared/utils/toast';
import type { RoleAdmin } from '../interfaces/role.interface';
import type { CreateMenuItemPayload, MenuItemAdmin, UpdateMenuItemPayload } from '../interfaces/menu.interface';

const FETCH_LIMIT = 100; // catálogo pequeño — se trae completo una vez, sin paginación, y se busca/filtra en el front

// Estado inicial del formulario de registro — app_access/is_active arrancan igual que el default del backend.
const EMPTY_CREATE_FORM: CreateMenuItemPayload = {
    key: '',
    label: '',
    icon: null,
    path: null,
    parent_key: null,
    app_access: 'admin',
    group_title: null,
    sort_order: 0,
    is_active: true,
    role_ids: [],
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (item: MenuItemAdmin): Required<UpdateMenuItemPayload> => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    path: item.path,
    parent_key: item.parentKey,
    app_access: item.appAccess,
    group_title: item.groupTitle,
    sort_order: item.sortOrder,
    is_active: item.isActive,
    role_ids: item.roleIds,
});

/** Listado de ítems de menú (búsqueda en el front) + alta + edición + baja: todo se maneja íntegramente acá. */
export const useMenuItems = () => {
    const [allItems, setAllItems] = useState<MenuItemAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');

    const [roles, setRoles] = useState<RoleAdmin[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdateMenuItemPayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateMenuItemPayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingItem, setDeletingItem] = useState<MenuItemAdmin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchItems = async () => {
            try {
                const res = await MenuService.list(1, FETCH_LIMIT);
                if (active) setAllItems(res.data);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchItems();

        return () => { active = false; };
    }, [reloadToken]);

    // Roles activos, para los checkboxes de "quién ve este ítem" — se cargan una sola vez.
    useEffect(() => {
        let active = true;

        PermissionService.listRoles()
            .then((allRoles) => { if (active) setRoles(allRoles.filter((role) => role.isActive)); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, []);

    const items = useMemo(() => {
        const term = normalizeStr(search);
        if (!term) return allItems;
        return allItems.filter((item) =>
            normalizeStr(item.key).includes(term)
            || normalizeStr(item.label).includes(term)
            || normalizeStr(item.groupTitle).includes(term));
    }, [allItems, search]);

    // Opciones para el select de "ítem padre" — solo ítems de nivel raíz (sin parentKey),
    // porque el menú admite un único nivel de anidamiento: padre → hijo.
    const parentOptions = useMemo(
        () => allItems
            .filter((item) => !item.parentKey)
            .map((item) => ({ value: item.key, label: `${item.label} (${item.key})` })),
        [allItems]
    );

    const reload = () => {
        setIsLoading(true);
        setReloadToken((token) => token + 1);
    };

    const openEdit = (item: MenuItemAdmin) => {
        setEditingId(item.id);
        setForm(toEditForm(item));
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdateMenuItemPayload) => (value: string | number | boolean | null) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const toggleFormRole = (roleId: number) => {
        setForm((prev) => (prev ? { ...prev, role_ids: toggleInArray(prev.role_ids, roleId) } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await MenuService.update(editingId, trimValues(form));
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

    const setCreateField = (name: keyof CreateMenuItemPayload) => (value: string | number | boolean | null) => {
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleCreateFormRole = (roleId: number) => {
        setCreateForm((prev) => ({ ...prev, role_ids: toggleInArray(prev.role_ids, roleId) }));
    };

    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreating(true);
        toast.loading('Registrando ítem de menú...');
        try {
            const result = await MenuService.create(trimValues(createForm));
            toast.success(result.message);
            closeCreate();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreating(false);
        }
    };

    const openDelete = (item: MenuItemAdmin) => setDeletingItem(item);
    const closeDelete = () => setDeletingItem(null);

    const confirmDelete = async () => {
        if (!deletingItem) return;

        setIsDeleting(true);
        toast.loading('Eliminando ítem de menú...');
        try {
            const result = await MenuService.delete(deletingItem.id);
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
        search, setSearch,
        parentOptions, roles,
        editingId, isEditOpen: editingId !== null, form, setField, toggleFormRole, openEdit, closeEdit, handleSubmit, isSaving,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, toggleCreateFormRole, handleCreateSubmit, isCreating,
        deletingItem, isDeleteOpen: deletingItem !== null, openDelete, closeDelete, confirmDelete, isDeleting,
    };
};

const toggleInArray = (arr: number[], value: number): number[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
