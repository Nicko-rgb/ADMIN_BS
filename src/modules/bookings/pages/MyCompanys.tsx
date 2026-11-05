import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, ChevronDown, ChevronUp, MapPin, Search } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';
import type { ContextCompany } from '../../../shared/interfaces/session.interface';
import type { PaginationMeta } from '../../../shared/interfaces/pagination.interface';
import type { CompanyAdmin, CompanySubsidiary } from '../../companys/interfaces/company.interface';
import CompanyService from '../../companys/service/companyService';
import SucursalService from '../../companys/service/sucursalService';
import '../styles/MyCompanys.css';

const PAGE_SIZE = 20;

const Branches = ({ branches }: { branches: { publicId: string; name: string; detail?: string | null }[] }) => {
    const location = useLocation();
    return branches.length ? (
        <ul className="booking_companies_branches">
            {branches.map((branch) => (
                <li className="booking_companies_branch" key={branch.publicId}>
                    <span className="booking_companies_branch_icon"><MapPin size={17} /></span>
                    <div className="booking_companies_branch_info"><strong>{branch.name}</strong><span>{branch.detail || 'Sucursal'}</span></div>
                    <Link className="booking_companies_branch_link" to={`/bookings/sucursals/${encodeURIComponent(branch.publicId)}`} state={{ branchName: branch.name, returnTo: location.pathname + location.search }} aria-label={`Ir a reservas de ${branch.name}`}>
                        Ir a reservas <ArrowRight size={16} />
                    </Link>
                </li>
            ))}
        </ul>
    ) : <p className="booking_companies_empty_branch">No hay sucursales disponibles.</p>;
};

const ContextCompanyCard = ({ company }: { company: ContextCompany }) => (
    <article className="booking_companies_card">
        <div className="booking_companies_card_header">
            <span className="booking_companies_company_icon"><Building2 size={21} /></span>
            <div className="booking_companies_card_title">
                <h3>{company.name}</h3>
                <p>{company.country?.name || 'Empresa'} · {company.sucursales.filter((branch) => branch.access).length} {company.sucursales.filter((branch) => branch.access).length === 1 ? 'sucursal' : 'sucursales'}</p>
            </div>
        </div>
        <Branches branches={company.sucursales.filter((branch) => branch.access).map((branch) => ({
            publicId: branch.publicId, name: branch.name,
            detail: `${branch.spaces.filter((space) => space.access).length} ${branch.spaces.filter((space) => space.access).length === 1 ? 'espacio deportivo' : 'espacios deportivos'}`,
        }))} />
    </article>
);

const SystemCompanyCard = ({ company }: { company: CompanyAdmin }) => {
    const [open, setOpen] = useState(false);
    const [branches, setBranches] = useState<CompanySubsidiary[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const toggle = async () => {
        if (open) { setOpen(false); return; }
        setOpen(true);
        if (branches !== null) return;
        setLoading(true);
        setError(false);
        try {
            setBranches(await SucursalService.listByCompany(company.publicId));
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <article className="booking_companies_card">
            <div className="booking_companies_card_header">
                <span className="booking_companies_company_icon"><Building2 size={21} /></span>
                <div className="booking_companies_card_title"><h3>{company.name}</h3><p>Documento: {company.document || 'No registrado'}</p></div>
                <button className="booking_companies_expand" type="button" onClick={() => void toggle()} aria-expanded={open}>
                    {open ? 'Ocultar sucursales' : 'Ver sucursales'} {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </button>
            </div>
            {open && (loading ? <p className="booking_companies_empty_branch" role="status">Cargando sucursales...</p>
                : error ? <p className="booking_companies_empty_branch" role="alert">No se pudieron cargar las sucursales. Cierra y vuelve a abrir para reintentar.</p>
                    : <Branches branches={(branches ?? []).map((branch) => ({ ...branch, detail: branch.address }))} />)}
        </article>
    );
};

const SystemCompanies = () => {
    const [params, setParams] = useSearchParams();
    const search = params.get('search')?.trim() ?? '';
    const rawPage = Number(params.get('page') || 1);
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const [items, setItems] = useState<CompanyAdmin[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        // Cada cambio de URL inicia una nueva consulta y oculta resultados anteriores.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(false);
        CompanyService.list(page, PAGE_SIZE, search).then((response) => {
            if (active) { setItems(response.data); setPagination(response.pagination); }
        }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [page, search, retry]);

    const updateParams = (nextSearch: string, nextPage: number) => {
        const next = new URLSearchParams();
        if (nextSearch) next.set('search', nextSearch);
        if (nextPage > 1) next.set('page', String(nextPage));
        setParams(next);
    };
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateParams(String(new FormData(event.currentTarget).get('search') ?? '').trim(), 1);
    };

    return (
        <>
            <form key={search} className="booking_companies_search" onSubmit={submit} role="search">
                <label htmlFor="booking-company-search">Buscar empresa</label>
                <div className="booking_companies_search_row">
                    <div className="booking_companies_input"><Search size={19} /><input id="booking-company-search" name="search" defaultValue={search} placeholder="Nombre o documento" /></div>
                    <button type="submit">Buscar</button>
                </div>
            </form>
            <div className="booking_companies_section_heading"><div><h2>Empresas</h2><p>Busca una empresa para consultar sus sucursales.</p></div></div>
            {loading ? <p className="booking_companies_message" role="status">Cargando empresas...</p>
                : error ? <div className="booking_companies_message" role="alert">No se pudieron cargar las empresas. <button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div>
                    : items.length ? <div className="booking_companies_list">{items.map((company) => <SystemCompanyCard key={company.publicId} company={company} />)}</div>
                        : <p className="booking_companies_message">{search ? 'No encontramos empresas para esta búsqueda.' : 'No hay empresas registradas.'}</p>}
            {!loading && !error && pagination && pagination.totalPages > 1 && (
                <nav className="booking_companies_pagination" aria-label="Páginas de empresas">
                    <button type="button" disabled={page <= 1} onClick={() => updateParams(search, page - 1)}>Anterior</button>
                    <span>Página {page} de {pagination.totalPages}</span>
                    <button type="button" disabled={page >= pagination.totalPages} onClick={() => updateParams(search, page + 1)}>Siguiente</button>
                </nav>
            )}
        </>
    );
};

const MyCompanys = () => {
    const scopeLevel = useSessionStore((state) => state.scopeLevel);
    const companies = useCompanyContextStore((state) => state.companies);
    const isSystem = scopeLevel === 1;

    return (
        <main className="booking_companies_page">
            <Header title="Reservas" subtitle="Empresas y sucursales disponibles para gestionar reservas" icon={CalendarDays} />
            {isSystem ? <SystemCompanies /> : (
                <>
                    <div className="booking_companies_section_heading"><div><h2>Mis empresas y sucursales</h2><p>Estas son las empresas y sucursales disponibles en tu cuenta.</p></div></div>
                    {companies.length ? <div className="booking_companies_list">{companies.map((company) => <ContextCompanyCard key={company.publicId} company={company} />)}</div>
                        : <p className="booking_companies_message">No tienes empresas ni sucursales asignadas.</p>}
                </>
            )}
        </main>
    );
};

export default MyCompanys;
