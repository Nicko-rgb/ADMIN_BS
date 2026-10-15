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
type FormModalMode = 'create' | 'edit';

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

    // Modal único de permiso — el modo decide si guarda por create o por update.
    const [permissionModalMode, setPermissionModalMode] = useState<FormModalMode | null>(null);
    const [editingPermissionId, setEditingPermissionId] = useState<number | null>(null);
    const [permissionForm, setPermissionForm] = useState<CreatePermissionPayload>(EMPTY_CREATE_FORM);
    const [isSavingPermission, setIsSavingPermission] = useState(false);

    const [deletingItem, setDeletingItem] = useState<PermissionAdmin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Servida dinámica, sin paginar — reusada por el picker de ManageRolePermissions (evita un
    // segundo fetch: es la misma data que ya trae listAssignable()).
    const [permissionCatalog, setPermissionCatalog] = useState<PermissionAdmin[]>([]);

    // ── Roles ────────────────────────────────────────────────────────────────
    const [roleItems, setRoleItems] = useState<RoleAdmin[]>([]);
    const [isRolesLoading, setIsRolesLoading] = useState(true);
    const [roleReloadToken, setRoleReloadToken] = useState(0);

    // Modal único de rol — misma idea que el de permiso: el modo decide el submit.
    const [roleModalMode, setRoleModalMode] = useState<FormModalMode | null>(null);
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [roleForm, setRoleForm] = useState<CreateRolePayload>(EMPTY_ROLE_CREATE_FORM);
    const [isSavingRole, setIsSavingRole] = useState(false);

    const [deletingRole, setDeletingRole] = useState<RoleAdmin | null>(null);
    const [isDeletingRole, setIsDeletingRole] = useState(false);

    const [managingRole, setManagingRole] = useState<RoleAdmin | null>(null);
    const [assignedRoleKeys, setAssignedRoleKeys] = useState<string[]>([]);
    const [syncRoleToUsers, setSyncRoleToUsers] = useState(false);
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

    // Servida dinámica — se carga una sola vez, alimenta el picker de ManageRolePermissions.
    useEffect(() => {
        let active = true;

        PermissionService.listAssignable()
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

    const openPermissionCreate = () => {
        setPermissionForm(EMPTY_CREATE_FORM);
        setEditingPermissionId(null);
        setPermissionModalMode('create');
    };

    const openPermissionEdit = (item: PermissionAdmin) => {
        setEditingPermissionId(item.id);
        setPermissionForm(toEditForm(item));
        setPermissionModalMode('edit');
    };

    const closePermissionModal = () => setPermissionModalMode(null);

    const setPermissionField = (name: keyof CreatePermissionPayload) => (value: string | null) => {
        setPermissionForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePermissionSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!permissionModalMode) return;
        if (permissionModalMode === 'edit' && editingPermissionId === null) return;

        setIsSavingPermission(true);
        toast.loading(permissionModalMode === 'create' ? 'Registrando permiso...' : 'Guardando cambios...');
        try {
            const result = permissionModalMode === 'create'
                ? await PermissionService.create(trimValues(permissionForm))
                : await PermissionService.update(editingPermissionId!, trimValues(permissionForm));
            toast.success(result.message);
            closePermissionModal();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingPermission(false);
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

    const openRoleCreate = () => {
        setRoleForm(EMPTY_ROLE_CREATE_FORM);
        setEditingRoleId(null);
        setRoleModalMode('create');
    };

    const openRoleEdit = (item: RoleAdmin) => {
        setEditingRoleId(item.id);
        setRoleForm({ key: item.key, ...toRoleEditForm(item) });
        setRoleModalMode('edit');
    };

    const closeRoleModal = () => setRoleModalMode(null);

    const setRoleField = (name: keyof CreateRolePayload) => (value: string | number | boolean | null) => {
        setRoleForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!roleModalMode) return;
        if (roleModalMode === 'edit' && editingRoleId === null) return;

        setIsSavingRole(true);
        toast.loading(roleModalMode === 'create' ? 'Registrando rol...' : 'Guardando cambios...');
        try {
            const result = roleModalMode === 'create'
                ? await PermissionService.createRole(trimValues(roleForm))
                : await PermissionService.updateRole(editingRoleId!, trimValues(roleForm));
            toast.success(result.message);
            closeRoleModal();
            reloadRoles();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingRole(false);
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

    // Abre el modal de plantilla del rol y trae las keys que ya tiene.
    const openManageRolePermissions = async (row: RoleAdmin) => {
        setManagingRole(row);
        setSyncRoleToUsers(false);
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
        setSyncRoleToUsers(false);
    };

    const toggleRolePermission = (key: string) => {
        setAssignedRoleKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    // Manda siempre el set completo tildado — el backend reemplaza la plantilla.
    // Con sync tildado, además propaga el diff a los usuarios existentes de ese rol.
    const saveManageRolePermissions = async () => {
        if (!managingRole) return;

        setIsSavingRolePermissions(true);
        toast.loading('Guardando permisos...');
        try {
            const result = await PermissionService.replaceRolePermissions(managingRole.id, assignedRoleKeys, syncRoleToUsers);
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
        isPermissionModalOpen: permissionModalMode !== null, permissionModalMode,
        permissionForm, setPermissionField, openPermissionCreate, openPermissionEdit, closePermissionModal, handlePermissionSubmit, isSavingPermission,
        deletingItem, isDeleteOpen: deletingItem !== null, openDelete, closeDelete, confirmDelete, isDeleting,

        // Roles
        roleItems, isRolesLoading,
        permissionCatalog,
        isRoleModalOpen: roleModalMode !== null, roleModalMode,
        roleForm, setRoleField, openRoleCreate, openRoleEdit, closeRoleModal, handleRoleSubmit, isSavingRole,
        deletingRole, isRoleDeleteOpen: deletingRole !== null, openRoleDelete, closeRoleDelete, confirmRoleDelete, isDeletingRole,
        isManageRolePermissionsOpen: managingRole !== null, managingRole, assignedRoleKeys, syncRoleToUsers, setSyncRoleToUsers, isLoadingRolePermissions, isSavingRolePermissions,
        openManageRolePermissions, closeManageRolePermissions, toggleRolePermission, saveManageRolePermissions,
    };
};
