import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import PermissionService from '../service/permissionService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import type { PaginationMeta } from '../../../shared/interfaces/pagination.interface';
import type { CreatePermissionPayload, PermissionAdmin, PermissionModule, UpdatePermissionPayload } from '../interfaces/permission.interface';
import type { RoleAdmin } from '../../../shared/interfaces/catalog.interface';
import type { CreateRolePayload, UpdateRolePayload } from '../interfaces/role.interface';

const PAGE_LIMIT = 20; // igual al default de paginationQuerySchema en el backend
const SEARCH_DEBOUNCE_MS = 500;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 };

// Estado inicial del formulario de registro — app_access arranca igual que el default del backend.
const EMPTY_CREATE_FORM: CreatePermissionPayload = {
    key: '',
    label: '',
    description: null,
    module: 'system',
    group_name: '',
    app_access: 'admin',
};

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (item: PermissionAdmin): Required<UpdatePermissionPayload> => ({
    key: item.key,
    label: item.label,
    description: item.description,
    module: item.module,
    group_name: item.groupName,
    app_access: item.appAccess,
});

const EMPTY_ROLE_CREATE_FORM: CreateRolePayload = {
    key: '',
    label: '',
    scope_level: null,
    is_active: true,
};

const toRoleEditForm = (item: RoleAdmin): Required<UpdateRolePayload> => ({
    label: item.label,
    scope_level: item.scopeLevel,
    is_active: item.isActive,
});

/**
 * Estado y acciones de la página Permisos — dos tabs (PermissionsPage.tsx): catálogo de
 * permisos granulares y roles (alta/edición/baja + sus permisos base). Un solo hook para las
 * dos porque comparten página y el catálogo de permisos ya cargado acá alimenta también el
 * picker de ManageRolePermissions, sin duplicar el fetch.
 */
export const usePermissions = () => {
    // ── Catálogo de permisos ────────────────────────────────────────────────
    const [items, setItems] = useState<PermissionAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [moduleFilter, setModuleFilter] = useState('');
    const [moduleOptions, setModuleOptions] = useState<PermissionModule[]>([]);
    const [groupFilter, setGroupFilter] = useState('');
    const [groupOptions, setGroupOptions] = useState<string[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdatePermissionPayload> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreatePermissionPayload>(EMPTY_CREATE_FORM);
    const [isCreating, setIsCreating] = useState(false);

    const [deletingItem, setDeletingItem] = useState<PermissionAdmin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Catálogo completo, sin paginar — reusado por el picker de ManageRolePermissions (evita un
    // segundo fetch: es la misma data que ya trae listCatalog()).
    const [permissionCatalog, setPermissionCatalog] = useState<PermissionAdmin[]>([]);

    // ── Roles ────────────────────────────────────────────────────────────────
    const [roleItems, setRoleItems] = useState<RoleAdmin[]>([]);
    const [isRolesLoading, setIsRolesLoading] = useState(true);
    const [roleReloadToken, setRoleReloadToken] = useState(0);

    const [editingRole, setEditingRole] = useState<RoleAdmin | null>(null);
    const [roleForm, setRoleForm] = useState<Required<UpdateRolePayload> | null>(null);
    const [isSavingRole, setIsSavingRole] = useState(false);

    const [isRoleCreateOpen, setIsRoleCreateOpen] = useState(false);
    const [roleCreateForm, setRoleCreateForm] = useState<CreateRolePayload>(EMPTY_ROLE_CREATE_FORM);
    const [isCreatingRole, setIsCreatingRole] = useState(false);

    const [deletingRole, setDeletingRole] = useState<RoleAdmin | null>(null);
    const [isDeletingRole, setIsDeletingRole] = useState(false);

    const [managingRole, setManagingRole] = useState<RoleAdmin | null>(null);
    const [assignedRoleKeys, setAssignedRoleKeys] = useState<string[]>([]);
    const [isLoadingRolePermissions, setIsLoadingRolePermissions] = useState(false);
    const [isSavingRolePermissions, setIsSavingRolePermissions] = useState(false);

    const setPage = (page: number) => setPagination((prev) => ({ ...prev, page }));

    // Debounce del término de búsqueda — evita un request por tecla.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [search]);

    // Toda búsqueda o filtro nuevo vuelve a la primera página.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, moduleFilter, groupFilter]);

    // Módulos y grupos distintos del catálogo, para los selects de filtro — se cargan una sola vez.
    useEffect(() => {
        let active = true;

        PermissionService.listModules()
            .then(({ modules, groups }) => {
                if (active) {
                    setModuleOptions(modules);
                    setGroupOptions(groups);
                }
            })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, []);

    // Catálogo completo de permisos — se carga una sola vez, alimenta el picker de ManageRolePermissions.
    useEffect(() => {
        let active = true;

        PermissionService.listCatalog()
            .then((catalog) => { if (active) setPermissionCatalog(catalog); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchPermissions = async () => {
            setIsLoading(true);
            try {
                const res = await PermissionService.list(pagination.page, PAGE_LIMIT, debouncedSearch, moduleFilter, groupFilter);
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
    }, [pagination.page, debouncedSearch, moduleFilter, groupFilter, reloadToken]);

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

    // ── Roles: fetch + alta/edición/baja + permisos base ─────────────────────

    useEffect(() => {
        let active = true;

        const fetchRoles = async () => {
            setIsRolesLoading(true);
            try {
                const roles = await PermissionService.listRoles();
                if (active) setRoleItems(roles);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsRolesLoading(false);
            }
        };

        fetchRoles();

        return () => { active = false; };
    }, [roleReloadToken]);

    const reloadRoles = () => setRoleReloadToken((token) => token + 1);

    const openRoleEdit = (item: RoleAdmin) => {
        setEditingRole(item);
        setRoleForm(toRoleEditForm(item));
    };

    const closeRoleEdit = () => {
        setEditingRole(null);
        setRoleForm(null);
    };

    const setRoleField = (name: keyof UpdateRolePayload) => (value: string | number | boolean | null) => {
        setRoleForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleRoleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingRole || !roleForm) return;

        setIsSavingRole(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await PermissionService.updateRole(editingRole.id, trimValues(roleForm));
            toast.success(result.message);
            closeRoleEdit();
            reloadRoles();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingRole(false);
        }
    };

    const openRoleCreate = () => {
        setRoleCreateForm(EMPTY_ROLE_CREATE_FORM);
        setIsRoleCreateOpen(true);
    };

    const closeRoleCreate = () => setIsRoleCreateOpen(false);

    const setRoleCreateField = (name: keyof CreateRolePayload) => (value: string | number | boolean | null) => {
        setRoleCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsCreatingRole(true);
        toast.loading('Registrando rol...');
        try {
            const result = await PermissionService.createRole(trimValues(roleCreateForm));
            toast.success(result.message);
            closeRoleCreate();
            reloadRoles();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsCreatingRole(false);
        }
    };

    const openRoleDelete = (item: RoleAdmin) => setDeletingRole(item);
    const closeRoleDelete = () => setDeletingRole(null);

    const confirmRoleDelete = async () => {
        if (!deletingRole) return;

        setIsDeletingRole(true);
        toast.loading('Eliminando rol...');
        try {
            const result = await PermissionService.deleteRole(deletingRole.id);
            toast.success(result.message);
            closeRoleDelete();
            reloadRoles();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeletingRole(false);
        }
    };

    // Abre el modal de permisos base y trae los que ya tiene asignados este rol.
    const openManageRolePermissions = async (row: RoleAdmin) => {
        setManagingRole(row);
        setIsLoadingRolePermissions(true);
        try {
            const keys = await PermissionService.getRolePermissions(row.id);
            setAssignedRoleKeys(keys);
        } catch (err) {
            toast.error(handleApiError(err));
            setManagingRole(null);
        } finally {
            setIsLoadingRolePermissions(false);
        }
    };

    const closeManageRolePermissions = () => {
        setManagingRole(null);
        setAssignedRoleKeys([]);
    };

    const toggleRolePermission = (key: string) => {
        setAssignedRoleKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    // Manda siempre el set completo tildado — el backend reemplaza, aplica de inmediato a todos
    // los usuarios de ese rol (no hace falta que renueven sesión).
    const saveManageRolePermissions = async () => {
        if (!managingRole) return;

        setIsSavingRolePermissions(true);
        toast.loading('Guardando permisos...');
        try {
            const result = await PermissionService.replaceRolePermissions(managingRole.id, assignedRoleKeys);
            toast.success(result.message);
            closeManageRolePermissions();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingRolePermissions(false);
        }
    };

    return {
        // Permisos
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        moduleFilter, setModuleFilter, moduleOptions,
        groupFilter, setGroupFilter, groupOptions,
        isEditOpen: editingId !== null, form, setField, openEdit, closeEdit, handleSubmit, isSaving,
        isCreateOpen, createForm, openCreate, closeCreate, setCreateField, handleCreateSubmit, isCreating,
        deletingItem, isDeleteOpen: deletingItem !== null, openDelete, closeDelete, confirmDelete, isDeleting,

        // Roles
        roleItems, isRolesLoading,
        permissionCatalog,
        isRoleEditOpen: editingRole !== null, editingRole, roleForm, setRoleField, openRoleEdit, closeRoleEdit, handleRoleSubmit, isSavingRole,
        isRoleCreateOpen, roleCreateForm, openRoleCreate, closeRoleCreate, setRoleCreateField, handleRoleCreateSubmit, isCreatingRole,
        deletingRole, isRoleDeleteOpen: deletingRole !== null, openRoleDelete, closeRoleDelete, confirmRoleDelete, isDeletingRole,
        isManageRolePermissionsOpen: managingRole !== null, managingRole, assignedRoleKeys, isLoadingRolePermissions, isSavingRolePermissions,
        openManageRolePermissions, closeManageRolePermissions, toggleRolePermission, saveManageRolePermissions,
    };
};
