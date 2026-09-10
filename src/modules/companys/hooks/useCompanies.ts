import { useEffect, useState } from 'react';
import CompanyService from '../service/companyService';
import { useSessionStore } from '../../../shared/store/sessionStore';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import type { PaginationMeta } from '../../../shared/interfaces/pagination.interface';
import type { CompanyAdmin, CompanyEnabled } from '../interfaces/company.interface';

const PAGE_LIMIT = 20; // igual al default de paginationQuerySchema en el backend
const SEARCH_DEBOUNCE_MS = 500;

const EMPTY_PAGINATION: PaginationMeta = { page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 };

/**
 * Listado de empresas principales, paginado en el backend, con búsqueda por nombre/documento y
 * filtros por país y estado. `isSuperAdmin` — del rol en la sesión — le dice a la página si debe
 * mostrar la vista en cards (dueño de pocas empresas propias) o la tabla completa con filtros
 * (system, catálogo global).
 */
const useCompanies = () => {
    const role = useSessionStore((state) => state.user?.role);
    const isSuperAdmin = role === 'super_admin';

    const { countries, loadCountries } = useCatalogActive();
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    useEffect(() => { loadCountries(); }, [loadCountries]);

    const [items, setItems] = useState<CompanyAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<CompanyEnabled | ''>('');

    const setPage = (page: number) => setPagination((prev) => ({ ...prev, page }));

    // Debounce del término de búsqueda — evita un request por tecla.
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [search]);

    // Toda búsqueda o filtro nuevo vuelve a la primera página.
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, countryFilter, statusFilter]);

    useEffect(() => {
        let active = true;

        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const countryId = countryFilter ? Number(countryFilter) : undefined;
                const res = await CompanyService.list(pagination.page, PAGE_LIMIT, debouncedSearch, countryId, statusFilter);
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

        fetchCompanies();

        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo pagination.page dispara refetch, no todo el objeto (cambiaría de referencia en cada setPagination)
    }, [pagination.page, debouncedSearch, countryFilter, statusFilter]);

    return {
        items, isLoading, pagination, setPage,
        search, setSearch,
        countryFilter, setCountryFilter, countryOptions,
        statusFilter, setStatusFilter,
        isSuperAdmin,
    };
};

export default useCompanies;
