import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ManageUserService from '../service/manageUserService';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import { isManagedRole } from '../utils/userConstants';
import { isUserFormValid, toUserPayload, userFormFromDetail } from '../utils/userForm';
import type { PaginationMeta } from '../../../shared/interfaces/pagination.interface';
import type { ManagedRole, UserAdmin, UserFormValues } from '../interfaces/user.interface';

const PAGE_LIMIT = 20; // igual al default de paginationQuerySchema en el backend
const SEARCH_DEBOUNCE_MS = 500;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 };

// Catálogo global de usuarios, paginado en el backend, con búsqueda (nombre o correo), filtros por
// rol y país, edición (FormUserManage, sin sucursales: el catálogo no tiene contexto de empresa) y
// gestión de permisos directos (ManageUserPermissions).
const useUsers = () => {
    const [items, setItems] = useState<UserAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
    const [reloadToken, setReloadToken] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilterValue] = useState('');
    const [countryFilter, setCountryFilterValue] = useState('');

    const { countries, loadCountries, roles, loadRoles } = useCatalogActive();
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));
    const roleOptions = roles.map((role) => ({ value: role.key, label: role.label }));
    const roleLabel = (key: string) => roles.find((role) => role.key === key)?.label ?? key;

    const [editing, setEditing] = useState<{ role: ManagedRole; publicId: string } | null>(null);
    const [editValues, setEditValues] = useState<UserFormValues | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const setPage = (page: number) => setPagination((prev) => ({ ...prev, page }));

    // Toda búsqueda o filtro nuevo vuelve a la primera página.
    const setRoleFilter = (value: string) => {
        setRoleFilterValue(value);
        setPage(1);
    };

    const setCountryFilter = (value: string) => {
        setCountryFilterValue(value);
        setPage(1);
    };

    // Debounce del término de búsqueda — evita un request por tecla.
    useEffect(() => {
        const term = search.trim();
        const timeout = setTimeout(() => {
            setDebouncedSearch(term);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        loadCountries();
        loadRoles();
    }, [loadCountries, loadRoles]);

    useEffect(() => {
        let active = true;

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const countryId = countryFilter ? Number(countryFilter) : undefined;
                const res = await ManageUserService.list(pagination.page, PAGE_LIMIT, debouncedSearch, roleFilter, countryId);
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
    }, [pagination.page, debouncedSearch, roleFilter, countryFilter, reloadToken]);

    const reload = () => setReloadToken((token) => token + 1);

    // Edición ────────────────────────────────────────────────────────────────────────────────

    const openEdit = async (row: UserAdmin) => {
        if (!isManagedRole(row.role)) return;
        const role = row.role;

        setEditing({ role, publicId: row.publicId });
        setEditValues(null);
        setIsLoadingDetail(true);
        try {
            const detail = await ManageUserService.getById(role, row.publicId);
            setEditValues(userFormFromDetail(role, detail, false));
        } catch (err) {
            toast.error(handleApiError(err));
            setEditing(null);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const closeEdit = () => {
        setEditing(null);
        setEditValues(null);
    };

    const setEditField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
        setEditValues((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const isEditValid = editing !== null && editValues !== null && isUserFormValid(editing.role, 'edit', editValues);

    const handleSubmitEdit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editing || !editValues || !isEditValid) return;

        setIsSaving(true);
        toast.loading('Guardando cambios...');
        try {
            const result = await ManageUserService.update(editing.role, editing.publicId, toUserPayload(editing.role, 'edit', editValues));
            toast.success(result.message);
            closeEdit();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        roleFilter, setRoleFilter, roleOptions, roleLabel,
        countryFilter, setCountryFilter, countryOptions,
        editing, editValues, isLoadingDetail, isSaving, isEditValid, openEdit, closeEdit, setEditField, handleSubmitEdit,
    };
};

export default useUsers;
