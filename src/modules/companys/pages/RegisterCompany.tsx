import { Fragment } from 'react';
import { Building2, Check, MapPin, UserPlus, IdCard, Phone, CreditCard, ArrowLeft, ArrowRight, UploadCloud } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { InputField, SelectField, FormSection, FormRow } from '../../../shared/components';
import { DOCUMENT_TYPE_OPTIONS } from '../../users/utils/userConstants';
import useRegisterCompany from '../hooks/useRegisterCompany';
import type { DocumentType } from '../../users/interfaces/user.interface';
import '../styles/RegisterCompany.css';

const STEP_LABELS = ['Empresa', 'Dueño', 'Plan'] as const;

const FEATURES_PREVIEW_LIMIT = 5; // cuántas características se muestran antes del "+N más"
const UNLIMITED_LIMIT = 999; // convención del backend para "ilimitado" en max_subsidiaries/max_spaces/max_users (ver comentario del modelo SaaSPlan)

// Formatea un límite numérico del plan — "∞" cuando alcanza el tope de "ilimitado".
const formatPlanLimit = (value: number) => (value >= UNLIMITED_LIMIT ? '∞' : value);

const NOTIFICATIONS_TIER_LABELS: Record<string, string> = {
    basic: 'Notif. básicas',
    automated: 'Notif. automatizadas',
    full: 'Notif. full',
};

// Alta de empresa — wizard de 3 pasos (empresa, dueño, plan). Todo el estado y la validación
// viven en useRegisterCompany; esta página solo arma el JSX de cada paso según el step actual.
const RegisterCompany = () => {
    const {
        step, direction, goNext, goBack,
        companyForm, setCompanyField, isCompanyStepValid,
        ownerForm, setOwnerField, isOwnerStepValid,
        planForm, setPlanField, isPlanStepValid,
        countryOptions, plans,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        isSubmitting, handleRegister,
    } = useRegisterCompany();

    return (
        <div className="register_company">
            <Header
                title="Registrar empresa"
                subtitle="Alta de una nueva empresa, su dueño y su plan"
                icon={Building2}
                breadcrumbs={[{ label: 'Empresas', path: '/companys' }]}
            />

            <div className="register_steps_card">
                {STEP_LABELS.map((label, index) => {
                    const stepNumber = (index + 1) as 1 | 2 | 3;
                    const isActive = stepNumber === step;
                    const isDone = stepNumber < step;
                    return (
                        <Fragment key={label}>
                            <div className={`steps ${isActive ? 'is_active' : ''} ${isDone ? 'is_done' : ''}`}>
                                <span className="register_step_circle">{isDone ? <Check size={16} /> : stepNumber}</span>
                                <span className="register_step_label">{label}</span>
                            </div>
                            {index < STEP_LABELS.length - 1 && <div className="register_step_divider" />}
                        </Fragment>
                    );
                })}
            </div>

            <div className="register_card">
                <div key={step} className={`register_step_content register_slide_${direction}`}>
                    {step === 1 && (
                        <>
                            <FormSection title="Información general de la empresa" icon={Building2}>
                                <FormRow>
                                    <InputField name="name" label="Nombre" value={companyForm.name} onChange={(e) => setCompanyField('name')(e.target.value)} required />
                                    <InputField name="document" label="Documento (RUC)" value={companyForm.document} onChange={(e) => setCompanyField('document')(e.target.value)} required />
                                </FormRow>
                                <FormRow>
                                    <InputField name="phone_cell" label="Teléfono celular" value={companyForm.phone_cell} onChange={(e) => setCompanyField('phone_cell')(e.target.value)} required />
                                    <InputField name="phone" label="Teléfono fijo" value={companyForm.phone} onChange={(e) => setCompanyField('phone')(e.target.value)} />
                                </FormRow>
                                <FormRow>
                                    <InputField name="website" label="Sitio web" value={companyForm.website} onChange={(e) => setCompanyField('website')(e.target.value)} placeholder="https://..." />
                                </FormRow>
                            </FormSection>

                            <FormSection title="Ubigeo" icon={MapPin}>
                                <FormRow>
                                    <SelectField name="country_id" label="País" value={companyForm.country_id || ''} onChange={(e) => selectCompanyCountry(Number(e.target.value))} options={countryOptions} required />
                                    <SelectField
                                        name="department_id"
                                        label="Departamento"
                                        value={departmentId || ''}
                                        onChange={(e) => selectDepartment(Number(e.target.value))}
                                        options={departments.map((d) => ({ value: d.id, label: d.name }))}
                                        disabled={!companyForm.country_id || isLoadingUbigeo}
                                        required
                                    />
                                </FormRow>
                                <FormRow>
                                    <SelectField
                                        name="province_id"
                                        label="Provincia"
                                        value={provinceId || ''}
                                        onChange={(e) => selectProvince(Number(e.target.value))}
                                        options={provinces.map((p) => ({ value: p.id, label: p.name }))}
                                        disabled={!departmentId || isLoadingUbigeo}
                                        required
                                    />
                                    <SelectField
                                        name="ubigeo_id"
                                        label="Distrito"
                                        value={companyForm.ubigeo_id || ''}
                                        onChange={(e) => selectDistrict(Number(e.target.value))}
                                        options={districts.map((d) => ({ value: d.id, label: d.name }))}
                                        disabled={!provinceId || isLoadingUbigeo}
                                        required
                                    />
                                </FormRow>
                                <FormRow>
                                    <InputField name="address" label="Dirección" value={companyForm.address} onChange={(e) => setCompanyField('address')(e.target.value)} required />
                                </FormRow>
                            </FormSection>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <FormSection title="Datos personales" icon={UserPlus}>
                                <FormRow>
                                    <InputField name="first_name" label="Nombre" value={ownerForm.first_name} onChange={(e) => setOwnerField('first_name')(e.target.value)} required />
                                    <InputField name="last_name" label="Apellido" value={ownerForm.last_name} onChange={(e) => setOwnerField('last_name')(e.target.value)} required />
                                </FormRow>
                                <FormRow>
                                    <InputField name="date_birth" label="Fecha de nacimiento" type="date" value={ownerForm.date_birth} onChange={(e) => setOwnerField('date_birth')(e.target.value)} />
                                </FormRow>
                            </FormSection>

                            <FormSection title="Contacto y acceso" icon={Phone}>
                                <FormRow>
                                    <InputField name="email" label="Correo" type="email" value={ownerForm.email} onChange={(e) => setOwnerField('email')(e.target.value)} />
                                    <InputField name="password" label="Contraseña" type="password" value={ownerForm.password} onChange={(e) => setOwnerField('password')(e.target.value)} required />
                                </FormRow>
                                <FormRow>
                                    <InputField name="phone" label="Número de celular" value={ownerForm.phone} onChange={(e) => setOwnerField('phone')(e.target.value)} required />
                                    <SelectField name="owner_country_id" label="País" value={ownerForm.country_id || ''} onChange={(e) => setOwnerField('country_id')(Number(e.target.value))} options={countryOptions} required />
                                </FormRow>
                            </FormSection>

                            <FormSection title="Documento de identidad" icon={IdCard}>
                                <FormRow>
                                    <SelectField name="document_type" label="Tipo de documento" value={ownerForm.document_type} onChange={(e) => setOwnerField('document_type')(e.target.value as DocumentType)} options={DOCUMENT_TYPE_OPTIONS} required />
                                    <InputField name="document_number" label="Número de documento" value={ownerForm.document_number} onChange={(e) => setOwnerField('document_number')(e.target.value)} required />
                                </FormRow>
                            </FormSection>
                        </>
                    )}

                    {step === 3 && (
                        <FormSection title="Plan de suscripción" icon={CreditCard}>
                            <div className="register_billing_toggle">
                                <button type="button" className={planForm.billing_period === 'monthly' ? 'is_active' : ''} onClick={() => setPlanField('billing_period')('monthly')}>Mensual</button>
                                <button type="button" className={planForm.billing_period === 'yearly' ? 'is_active' : ''} onClick={() => setPlanField('billing_period')('yearly')}>Anual</button>
                            </div>

                            <div className="register_plans_grid">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        className={`register_plan_card ${planForm.plan_id === plan.id ? 'is_selected' : ''}`}
                                        onClick={() => setPlanField('plan_id')(plan.id)}
                                    >
                                        <span className="register_plan_radio">{planForm.plan_id === plan.id && <Check size={14} />}</span>

                                        <div className="register_plan_card_header">
                                            <span className="register_plan_card_name">{plan.name}</span>
                                        </div>

                                        <div className="register_plan_price">
                                            <strong>${Number(planForm.billing_period === 'monthly' ? plan.priceMonthly : plan.priceYearly).toFixed(2)}</strong>
                                            <span> / {planForm.billing_period === 'monthly' ? 'mes' : 'año'}</span>
                                        </div>

                                        <div className="register_plan_card_limits">
                                            <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxSubsidiaries)} Suc.</span>
                                            <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxSpaces)} Canchas</span>
                                            <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxUsers)} Usuarios</span>
                                            <span className="register_plan_limit_pill">{formatPlanLimit(plan.maxInvoicesMonthly)} Facturas/mes</span>
                                            <span className="register_plan_limit_pill">{NOTIFICATIONS_TIER_LABELS[plan.notificationsTier] ?? plan.notificationsTier}</span>
                                            {plan.hasAdvancedReports && <span className="register_plan_purple_pill">Reportes avanzados</span>}
                                            {plan.allowsMultiCompany && <span className="register_plan_purple_pill">Multi empresa</span>}
                                        </div>

                                        <ul className="register_plan_features">
                                            {plan.features.slice(0, FEATURES_PREVIEW_LIMIT).map((feature, index) => (
                                                <li key={`${feature}-${index}`}>
                                                    <Check size={14} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                            {plan.features.length > FEATURES_PREVIEW_LIMIT && (
                                                <li className="register_plan_features_more">+{plan.features.length - FEATURES_PREVIEW_LIMIT} más</li>
                                            )}
                                        </ul>
                                    </button>
                                ))}
                            </div>
                        </FormSection>
                    )}
                </div>

                <div className="register_footer">
                    <Button text="Atrás" icon={ArrowLeft} color="secondary" onClick={goBack} disabled={step === 1} />
                    {step < 3 ? (
                        <Button
                            text="Siguiente"
                            icon={ArrowRight}
                            iconPosition="right"
                            onClick={goNext}
                            disabled={step === 1 ? !isCompanyStepValid : !isOwnerStepValid}
                        />
                    ) : (
                        <Button
                            text="Registrar empresa"
                            icon={UploadCloud}
                            onClick={handleRegister}
                            disabled={!isPlanStepValid}
                            loading={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterCompany;
