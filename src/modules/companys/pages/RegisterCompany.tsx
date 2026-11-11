import { Fragment } from 'react';
import { Building2, Check, ArrowLeft, ArrowRight, UploadCloud } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { ForbiddenScreen, FormSection, SelectField } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import { usePageHeader } from '../../../shared/store/headerStore';
import CompanyStepForm from '../components/CompanyStepForm';
import PlanStepForm from '../components/PlanStepForm';
import FormUserManage from '../../users/components/FormUserManage';
import useRegisterCompany from '../hooks/useRegisterCompany';
import '../styles/RegisterCompany.css';

// Alta de empresa — wizard de 3 pasos (empresa, dueño, plan). Todo el estado y la validación
// viven en useRegisterCompany; esta página solo arma el paso actual con CompanyStepForm,
// FormUserManage (dueño, rol super_admin) y PlanStepForm según el step actual.
const RegisterCompany = () => {
    const {
        step, totalSteps, direction, goNext, goBack,
        isPrimaryRegistration, sourceCompanies, sourceCompanyPublicId, setSourceCompany,
        companyForm, setCompanyField, companyErrors,
        ownerValues, setOwnerField, ownerErrors,
        planForm, setPlanField, isPlanStepValid,
        countryOptions, plans,
        departments, provinces, districts, departmentId, provinceId,
        selectCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        isSubmitting, handleRegister,
    } = useRegisterCompany();

    const can = usePermission();
    usePageHeader({
        title: 'Registrar empresa',
        subtitle: isPrimaryRegistration ? 'Alta de una empresa primaria, su dueño y su plan' : 'Alta de una empresa hermana dentro de tu grupo',
        icon: Building2,
        breadcrumbs: [
            { label: 'Empresas', path: '/companys' },
            { label: 'Registrar empresa' },
        ],
    });

    if (!can('company.create')) {
        return <ForbiddenScreen />;
    }

    return (
        <div className="register_company">
            <div className="register_steps_card">
                {(isPrimaryRegistration ? ['Empresa', 'Dueño', 'Plan'] : ['Empresa', 'Suscripción compartida']).map((label, index) => {
                    const stepNumber = (index + 1) as 1 | 2 | 3;
                    const isActive = stepNumber === step;
                    const isDone = stepNumber < step;
                    return (
                        <Fragment key={label}>
                            <div className={`steps ${isActive ? 'is_active' : ''} ${isDone ? 'is_done' : ''}`}>
                                <span className="register_step_circle">{isDone ? <Check size={16} /> : stepNumber}</span>
                                <span className="register_step_label">{label}</span>
                            </div>
                            {index < totalSteps - 1 && <div className="register_step_divider" />}
                        </Fragment>
                    );
                })}
            </div>

            <div className="register_card">
                <div key={step} className={`register_step_content register_slide_${direction}`}>
                    {step === 1 && (
                        <CompanyStepForm
                            form={companyForm}
                            setField={setCompanyField}
                            errors={companyErrors}
                            countryOptions={countryOptions}
                            departments={departments}
                            provinces={provinces}
                            districts={districts}
                            departmentId={departmentId}
                            provinceId={provinceId}
                            selectCountry={selectCountry}
                            selectDepartment={selectDepartment}
                            selectProvince={selectProvince}
                            selectDistrict={selectDistrict}
                            isLoadingUbigeo={isLoadingUbigeo}
                        />
                    )}

                    {step === 2 && isPrimaryRegistration && (
                        <FormUserManage role="super_admin" mode="register" values={ownerValues} onChange={setOwnerField} errors={ownerErrors} />
                    )}

                    {step === 3 && isPrimaryRegistration && (
                        <PlanStepForm plans={plans} form={planForm} setField={setPlanField} />
                    )}
                    {step === 2 && !isPrimaryRegistration && (
                        <FormSection title="Suscripción compartida" icon={Building2}>
                            <SelectField
                                name="source_company_public_id"
                                label="Empresa de origen"
                                value={sourceCompanyPublicId}
                                onChange={(event) => setSourceCompany(String(event.target.value))}
                                options={sourceCompanies.map((company) => ({ value: company.publicId, label: company.name }))}
                                required
                            />
                            <p>La nueva empresa compartirá el dueño y la suscripción de este grupo. El plan debe estar vigente y permitir multiempresa. Sus cupos de usuarios, sucursales y espacios se contarán por separado.</p>
                            {sourceCompanies.length === 0 && <p>No tienes una empresa o sucursal asignada para crear una empresa hermana.</p>}
                        </FormSection>
                    )}
                </div>

                <div className="register_footer">
                    <Button text="Atrás" icon={ArrowLeft} color="secondary" onClick={goBack} disabled={step === 1} />
                    {step < totalSteps ? (
                        <Button
                            text="Siguiente"
                            icon={ArrowRight}
                            iconPosition="right"
                            onClick={goNext}
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
