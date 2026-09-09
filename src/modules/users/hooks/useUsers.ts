import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import UserService from '../service/userService';
import UserPermissionService from '../service/userPermissionService';
import CountryService from '../../system/service/countryService';
import PermissionService from '../../system/service/permissionService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import type { PaginationMeta } from '../../../shared/interfaces/pagination.interface';
import type { PermissionAdmin } from '../../system/interfaces/permission.interface';
import type { UserAdmin, UserDetail, UpdateUserPayload } from '../interfaces/user.interface';

const PAGE_LIMIT = 20; // igual al default de paginationQuerySchema en el backend
const SEARCH_DEBOUNCE_MS = 500;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 };

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (detail: UserDetail): Required<UpdateUserPayload> => ({
    first_name: detail.firstName ?? '',
    last_name: detail.lastName ?? '',
    email: detail.email ?? '',
    role: detail.role,
    is_enabled: detail.isEnabled,
    phone: detail.phone,
    country_id: detail.countryId ?? 0,
    document_type: detail.documentType,
    document_number: detail.documentNumber,
    date_birth: detail.dateBirth,
});

// Listado de usuarios, paginado en el backend, con búsqueda (nombre o correo), filtros por rol y
// país, edición (todo menos password) vía UserEdit, y gestión de permisos directos vía ManageUserPermissions.
const useUsers = () => {
    const [items, setItems] = useState<UserAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    const [countryOptions, setCountryOptions] = useState<{ value: number; label: string }[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdateUserPayload> | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [permissionCatalog, setPermissionCatalog] = useState<PermissionAdmin[]>([]);
    const [managingUser, setManagingUser] = useState<UserAdmin | null>(null);
    const [assignedKeys, setAssignedKeys] = useState<string[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    const setPage = (page: number) => setPagination((prev) => ({ ...prev, page }));

    // Debounce del término de búsqueda — evita un request por tecla.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [search]);

    // Toda búsqueda o filtro nuevo vuelve a la primera página.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter, countryFilter]);

    // Países activos, para los selects de filtro y de edición — se cargan una sola vez.
    useEffect(() => {
        let active = true;

        CountryService.listActive()
            .then((countries) => {
                if (active) setCountryOptions(countries.map((country) => ({ value: country.id, label: country.country })));
            })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, []);

    // Catálogo completo de permisos, para el picker de ManageUserPermissions — se carga una sola vez.
    useEffect(() => {
        let active = true;

        PermissionService.listCatalog()
            .then((catalog) => { if (active) setPermissionCatalog(catalog); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const countryId = countryFilter ? Number(countryFilter) : undefined;
                const res = await UserService.list(pagination.page, PAGE_LIMIT, debouncedSearch, roleFilter, countryId);
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

        fetchUsers();

        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo pagination.page dispara refetch, no todo el objeto (cambiaría de referencia en cada setPagination)
    }, [pagination.page, debouncedSearch, roleFilter, countryFilter, reloadToken]);

    const reload = () => setReloadToken((token) => token + 1);

    // Abre el modal y trae el detalle completo por id — el listado no trae todos los campos editables.
    const openEdit = async (id: number) => {
        setEditingId(id);
        setIsLoadingDetail(true);
        try {
            const detail = await UserService.getById(id);
            setForm(toEditForm(detail));
        } catch (err) {
            toast.error(handleApiError(err));
            setEditingId(null);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
    };

    const setField = (name: keyof UpdateUserPayload) => (value: string | number | boolean | null) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await UserService.update(editingId, trimValues(form));
            toast.success(result.message);
            closeEdit();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    // Abre el modal de permisos y trae los directos que ya tiene asignados este usuario.
    const openManagePermissions = async (row: UserAdmin) => {
        setManagingUser(row);
        setIsLoadingPermissions(true);
        try {
            const keys = await UserPermissionService.getByUserId(row.id);
            setAssignedKeys(keys);
        } catch (err) {
            toast.error(handleApiError(err));
            setManagingUser(null);
        } finally {
            setIsLoadingPermissions(false);
        }
    };

    const closeManagePermissions = () => {
        setManagingUser(null);
        setAssignedKeys([]);
    };

    const togglePermission = (key: string) => {
        setAssignedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    // Manda siempre el set completo tildado — el backend reemplaza, no diferencia altas de bajas.
    const saveManagePermissions = async () => {
        if (!managingUser) return;

        setIsSavingPermissions(true);
        toast.loading('Guardando permisos...');
        try {
            const result = await UserPermissionService.update(managingUser.id, assignedKeys);
            toast.success(result.message);
            closeManagePermissions();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSavingPermissions(false);
        }
    };

    return {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        roleFilter, setRoleFilter,
        countryFilter, setCountryFilter, countryOptions,
        isEditOpen: editingId !== null, form, isLoadingDetail, openEdit, closeEdit, setField, handleSubmit, isSaving,
        permissionCatalog,
        isManagePermissionsOpen: managingUser !== null, managingUser, assignedKeys, isLoadingPermissions, isSavingPermissions,
        openManagePermissions, closeManagePermissions, togglePermission, saveManagePermissions,
    };
};

export default useUsers;
