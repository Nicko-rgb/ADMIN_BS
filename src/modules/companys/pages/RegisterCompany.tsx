import { Fragment } from 'react';
import { Building2, Check, ArrowLeft, ArrowRight, UploadCloud } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { ForbiddenScreen } from '../../../shared/components';
import { usePermission } from '../../../shared/hooks/usePermission';
import CompanyStepForm from '../components/CompanyStepForm';
import PlanStepForm from '../components/PlanStepForm';
import FormUserManage from '../../users/components/FormUserManage';
import useRegisterCompany from '../hooks/useRegisterCompany';
import '../styles/RegisterCompany.css';

const STEP_LABELS = ['Empresa', 'Dueño', 'Plan'] as const;

// Alta de empresa — wizard de 3 pasos (empresa, dueño, plan). Todo el estado y la validación
// viven en useRegisterCompany; esta página solo arma el paso actual con CompanyStepForm,
// FormUserManage (dueño, rol super_admin) y PlanStepForm según el step actual.
const RegisterCompany = () => {
    const {
        step, direction, goNext, goBack,
        companyForm, setCompanyField, isCompanyStepValid,
        ownerValues, setOwnerField, isOwnerStepValid,
        planForm, setPlanField, isPlanStepValid,
        countryOptions, plans,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        isSubmitting, handleRegister,
    } = useRegisterCompany();

    const can = usePermission();
    if (!can('company.create')) {
        return <ForbiddenScreen />;
    }

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
                        <CompanyStepForm
                            form={companyForm}
                            setField={setCompanyField}
                            countryOptions={countryOptions}
                            departments={departments}
                            provinces={provinces}
                            districts={districts}
                            departmentId={departmentId}
                            provinceId={provinceId}
                            selectCompanyCountry={selectCompanyCountry}
                            selectDepartment={selectDepartment}
                            selectProvince={selectProvince}
                            selectDistrict={selectDistrict}
                            isLoadingUbigeo={isLoadingUbigeo}
                        />
                    )}

                    {step === 2 && (
                        <FormUserManage role="super_admin" mode="register" values={ownerValues} onChange={setOwnerField} />
                    )}

                    {step === 3 && (
                        <PlanStepForm plans={plans} form={planForm} setField={setPlanField} />
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
