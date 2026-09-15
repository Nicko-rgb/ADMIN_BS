import { useNavigate } from 'react-router-dom';
import { Building2, Eye, Search } from 'lucide-react';
import { Table, TableImage, TableActions } from '../../../shared/components/Table';
import type { TableColumn } from '../../../shared/components/Table';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/formatDate';
import { formatPhone } from '../../../shared/utils/formatText';
import useCompanies from '../hooks/useCompanies';
import type { CompanyAdmin, CompanyEnabled } from '../interfaces/company.interface';
import { usePermission } from '../../../shared/hooks/usePermission';
import '../styles/CompanysPage.css';

const ENABLED_LABELS: Record<CompanyEnabled, string> = {
    A: 'Activo',
    I: 'Inactivo',
    P: 'Pendiente',
};

const ENABLED_CLASSNAMES: Record<CompanyEnabled, string> = {
    A: 'active',
    I: 'inactive',
    P: 'pending',
};

const STATUS_OPTIONS = [
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' },
    { value: 'P', label: 'Pendiente' },
];

// Listado de empresas principales — cards para super_admin (dueño de pocas empresas propias,
// sin buscador), tabla con filtros por país y estado para system (catálogo global).
const CompanysPage = () => {
    const navigate = useNavigate();
    const {
        items, isLoading,
        pagination, setPage,
        search, setSearch,
        countryFilter, setCountryFilter, countryOptions,
        statusFilter, setStatusFilter,
        isSuperAdmin,
    } = useCompanies();

    const can = usePermission();
    const canCreate = can('company.create');

    const goToCompany = (company: CompanyAdmin) => navigate(`/companys/company/${company.tenantId}`);

    const columns: TableColumn<CompanyAdmin>[] = [
        { key: 'name', header: 'Empresa' },
        { key: 'document', header: 'Documento' },
        { key: 'phoneCell', header: 'Teléfono', render: (row) => formatPhone(row.country?.phoneCode, row.phoneCell) || '—' },
        {
            key: 'country', header: 'País', render: (row) => row.country ? (
                <div className="table_cell_media">
                    <TableImage src={row.country.flagUrl} alt={row.country.name} />
                    <span>{row.country.name}</span>
                </div>
            ) : '—'
        },
        {
            key: 'owner', header: 'Dueño', render: (row) => row.owner ? (
                <div className="company_stacked_cell">
                    <span className="company_stacked_primary">{`${row.owner.firstName} ${row.owner.lastName}`}</span>
                    <span className="company_stacked_secondary">{row.owner.email ?? '—'}</span>
                </div>
            ) : <span className="company_empty_value">Sin dueño asignado</span>
        },
        {
            key: 'plan', header: 'Plan', render: (row) => row.plan ? (
                <div className="company_stacked_cell">
                    <span className="company_stacked_primary">{row.plan.name}</span>
                    <span className="company_stacked_secondary">{row.plan.status}</span>
                </div>
            ) : <span className="company_empty_value">Sin plan asignado</span>
        },
        {
            key: 'isEnabled', header: 'Estado', render: (row) => row.isEnabled ? (
                <span className={`status_badge ${ENABLED_CLASSNAMES[row.isEnabled]}`}>{ENABLED_LABELS[row.isEnabled]}</span>
            ) : '—'
        },
        { key: 'createdAt', header: 'Creado', render: (row) => formatDate(row.createdAt) },
        {
            key: 'actions', header: 'Acciones', render: (row) => (
                <TableActions actions={[
                    { label: 'Ver', icon: Eye, variant: 'view', onClick: () => goToCompany(row) },
                ]} />
            )
        },
    ];

    return (
        <div className="companys_page">
            <Header
                title="Empresas"
                subtitle="Empresas registradas en el sistema"
                icon={Building2}
                action={canCreate ? { label: 'Crear empresa', onClick: () => navigate('/companys/register-company') } : undefined}
            />

            {isSuperAdmin ? (
                <div className="companys_cards_grid">
                    {items.map((company) => (
                        <div key={company.id} className="company_card">
                            <div className="company_card_header">
                                <div className="company_card_icon"><Building2 size={22} /></div>
                                <div className="company_card_title">
                                    <h3>{company.name}</h3>
                                    <span>{company.document}</span>
                                </div>
                                {company.isEnabled && (
                                    <span className={`status_badge ${ENABLED_CLASSNAMES[company.isEnabled]}`}>{ENABLED_LABELS[company.isEnabled]}</span>
                                )}
                            </div>

                            <div className="company_card_body">
                                {company.country && (
                                    <div className="company_card_row">
                                        <TableImage src={company.country.flagUrl} alt={company.country.name} />
                                        <span>{company.country.name}</span>
                                    </div>
                                )}
                                <div className="company_card_row">
                                    <span>{formatPhone(company.country?.phoneCode, company.phoneCell) || '—'}</span>
                                </div>
                                <div className="company_card_row">
                                    {company.plan ? (
                                        <span>{company.plan.name} · {company.plan.status}</span>
                                    ) : (
                                        <span className="company_empty_value">Sin plan asignado</span>
                                    )}
                                </div>
                            </div>

                            <Button text="Gestionar" size="sm" onClick={() => goToCompany(company)} />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="companys_toolbar">
                        <div className="companys_toolbar_search">
                            <InputField
                                label="Buscar"
                                name="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nombre o documento..."
                                icon={Search}
                            />
                        </div>
                        <div className="companys_toolbar_filter">
                            <SelectField
                                label="País"
                                name="countryFilter"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(String(e.target.value))}
                                options={countryOptions}
                                showDefaultOption
                            />
                        </div>
                        <div className="companys_toolbar_filter">
                            <SelectField
                                label="Estado"
                                name="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as CompanyEnabled)}
                                options={STATUS_OPTIONS}
                                showDefaultOption
                            />
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        data={items}
                        keyExtractor={(row) => row.id}
                        isLoading={isLoading}
                        emptyMessage="No hay empresas registradas"
                        pagination={pagination}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
};

export default CompanysPage;
