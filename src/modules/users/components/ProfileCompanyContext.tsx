import { useState } from 'react';
import {
    Building2, ChevronLeft, ChevronRight, CircleCheck, Crown, Globe2, ShieldX,
    LayoutGrid, MapPin, Network, Plus, WalletCards,
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import type { ContextCompany, ContextSpace, ContextSucursal } from '../../../shared/interfaces/session.interface';
import '../styles/ProfileCompanyContext.css';

interface ProfileCompanyContextProps {
    companies: ContextCompany[];
    scopeLevel: number | null;
}

const SCOPE_COPY: Record<number, { title: string; description: string }> = {
    2: { title: 'Mi grupo de empresas', description: 'Empresas y sucursales disponibles dentro de tu suscripción.' },
    3: { title: 'Mis empresas y sucursales', description: 'Empresas padre de tus asignaciones y sus sucursales. Las acciones dependen de tus permisos.' },
    4: { title: 'Mis empresas y sucursales', description: 'Empresas padre de tus asignaciones y sus sucursales. Las acciones dependen de tus permisos.' },
};

const countLabel = (amount: number, singular: string, plural: string) =>
    String(amount) + ' ' + (amount === 1 ? singular : plural);

const AccessPill = ({ access }: { access: boolean }) => (
    <span className={'profile_context_access ' + (access ? 'has_access' : 'context_only')}>
        {access ? <><CircleCheck size={13} />En tu alcance</> : <><ShieldX size={13} />Fuera de tu alcance</>}
    </span>
);

const CountryPill = ({ country }: { country: ContextCompany['country'] }) => (
    <span className="profile_context_meta">
        <Globe2 size={14} />{country ? country.name + ' · ' + country.isoCode : 'País no registrado'}
    </span>
);

const Spaces = ({ spaces }: { spaces: ContextSpace[] }) => (
    <ul className="profile_context_spaces">
        {spaces.length > 0 ? spaces.map((space) => (
            <li key={space.publicId} className="profile_context_space">
                <span className="profile_context_node_icon"><LayoutGrid size={15} /></span>
                <span className="profile_context_space_name">{space.name}</span>
                <AccessPill access={space.access} />
            </li>
        )) : <li className="profile_context_space_empty">Sin espacios registrados.</li>}
    </ul>
);

const SucursalNode = ({ sucursal }: { sucursal: ContextSucursal }) => (
    <li className={'profile_context_sucursal ' + (sucursal.access ? 'has_access' : 'context_only')}>
        <div className="profile_context_sucursal_heading">
            <span className="profile_context_node_icon"><MapPin size={17} /></span>
            <div>
                <h4>{sucursal.name}</h4>
                <div className="profile_context_sucursal_meta">
                    <CountryPill country={sucursal.country} />
                    <span className="profile_context_meta"><WalletCards size={14} />{sucursal.currency ? sucursal.currency.symbol + ' · ' + sucursal.currency.code + ' · ' + sucursal.currency.name : 'Moneda no registrada'}</span>
                    <span className="profile_context_meta"><LayoutGrid size={14} />{countLabel(sucursal.spaces.length, 'espacio', 'espacios')}</span>
                </div>
            </div>
            <AccessPill access={sucursal.access} />
        </div>
        <Spaces spaces={sucursal.spaces} />
    </li>
);

interface CompanyNodeProps {
    company: ContextCompany;
}

const CompanyNode = ({ company }: CompanyNodeProps) => {
    const spaceCount = company.sucursales.reduce((total, sucursal) => total + sucursal.spaces.length, 0);

    return (
        <article className={'profile_context_company ' + (company.access ? 'has_access' : 'context_only')}>
            <div className="profile_context_company_header">
                <span className="profile_context_node_icon company"><Building2 size={21} /></span>
                <div className="profile_context_company_main">
                    <div className="profile_context_title_row">
                        <h3>{company.name}</h3>
                        {company.isPrimary && <span className="profile_context_primary"><Crown size={13} />Principal</span>}
                    </div>
                    <div className="profile_context_company_meta">
                        <CountryPill country={company.country} />
                        <span className="profile_context_meta"><Building2 size={14} />{countLabel(company.sucursales.length, 'sucursal', 'sucursales')}</span>
                        <span className="profile_context_meta"><LayoutGrid size={14} />{countLabel(spaceCount, 'espacio', 'espacios')}</span>
                    </div>
                </div>
                <AccessPill access={company.access} />
            </div>

            {company.sucursales.length > 0 ? (
                <ul className="profile_context_sucursales">
                    {company.sucursales.map((sucursal) => <SucursalNode key={sucursal.publicId} sucursal={sucursal} />)}
                </ul>
            ) : <p className="profile_context_empty_branch">Esta empresa no tiene sucursales visibles.</p>}
        </article>
    );
};

/** Árbol informativo recibido al iniciar sesión; nunca autoriza acciones por sí mismo. */
const ProfileCompanyContext = ({ companies, scopeLevel }: ProfileCompanyContextProps) => {
    const [companyIndex, setCompanyIndex] = useState(0);
    const copy = scopeLevel === null ? undefined : SCOPE_COPY[scopeLevel];
    const totalCompanies = companies.length;
    const currentIndex = Math.min(companyIndex, Math.max(totalCompanies - 1, 0));
    const company = companies[currentIndex];
    const canChangeCompany = totalCompanies > 1;

    const showPreviousCompany = () => {
        if (canChangeCompany) setCompanyIndex((currentIndex - 1 + totalCompanies) % totalCompanies);
    };

    const showNextCompany = () => {
        if (canChangeCompany) setCompanyIndex((currentIndex + 1) % totalCompanies);
    };

    if (!copy) return null;

    return (
        <section className="card profile_context_card" aria-labelledby="profile-context-title">
            <div className="profile_context_heading">
                <div className="profile_context_icon"><Network size={21} /></div>
                <div>
                    <h2 id="profile-context-title">{copy.title}</h2>
                    <p>{copy.description}</p>
                </div>
                <div className="profile_context_actions">
                    <nav className="profile_context_navigation" aria-label="Cambiar empresa">
                        <button type="button" onClick={showPreviousCompany} disabled={!canChangeCompany} aria-label="Empresa anterior"><ChevronLeft size={19} /></button>
                        <span>Empresa {company ? currentIndex + 1 : 0} de {totalCompanies}</span>
                        <button type="button" onClick={showNextCompany} disabled={!canChangeCompany} aria-label="Empresa siguiente"><ChevronRight size={19} /></button>
                    </nav>
                    <Button text="Ver árbol" icon={Network} color="secondary" size="sm" disabled title="Próximamente" />
                </div>
            </div>

            <div className="profile_context_current">
                {company ? <CompanyNode company={company} /> : (
                    <div className="profile_context_empty_state">
                        <p className="profile_context_empty">No tenés empresas ni sucursales asignadas actualmente.</p>
                        <Button text="Añadir empresa" icon={Plus} color="primary" size="sm" disabled title="Próximamente" />
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProfileCompanyContext;
