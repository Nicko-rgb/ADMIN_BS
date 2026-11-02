import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import toast from '../../../shared/utils/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import CompanyService from '../service/companyService';
import { COMPANY_REQUIRED_FIELDS, EMPTY_COMPANY_FORM } from '../utils/tenantForm';
import useTenantForm from './useTenantForm';
import { hasErrors } from '../../../shared/utils/formErrors';
import { createEmptyUserForm, toUserPayload, validateUserForm } from '../../users/utils/userForm';
import type { PlanStepForm } from '../interfaces/companyRegistration.interface';
import type { UserFormValues } from '../../users/interfaces/user.interface';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';

const EMPTY_PLAN_FORM: PlanStepForm = {
    plan_public_id: '',
    billing_period: 'monthly',
};

/**
 * Wizard de alta de empresa — 3 pasos (empresa, dueño, plan) en un solo hook. El paso "empresa"
 * reusa useTenantForm (mismo estado que la edición de empresa y que el modal de sucursal); el
 * paso "dueño" usa los helpers de FormUserManage con rol super_admin en modo alta.
 */
export const useRegisterCompany = () => {
    const navigate = useNavigate();
    const { plans, loadPlans } = useCatalogActive();
    const isPrimaryRegistration = useSessionStore((state) => state.scopeLevel === 1);
    const contextCompanies = useCompanyContextStore((state) => state.companies);
    const sourceCompanies = contextCompanies.filter((company) => company.access || company.sucursales.some((branch) => branch.access));
    const [selectedSource, setSourceCompany] = useState('');
    const sourceCompanyPublicId = selectedSource || (sourceCompanies.length === 1 ? sourceCompanies[0].publicId : '');

    useEffect(() => { if (isPrimaryRegistration) loadPlans(); }, [loadPlans, isPrimaryRegistration]);

    const [step, setStep] = useState<1 | 2 | 3>(1);

    const {
        form: companyForm, setField: setCompanyField, errors: companyErrors, isValid: isCompanyStepValid,
        countryOptions, departments, provinces, districts, departmentId, provinceId, isLoadingUbigeo,
        selectCountry, selectDepartment, selectProvince, selectDistrict,
    } = useTenantForm(EMPTY_COMPANY_FORM, COMPANY_REQUIRED_FIELDS);

    const [ownerValues, setOwnerValues] = useState<UserFormValues>(() => createEmptyUserForm('super_admin'));
    const setOwnerField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
        setOwnerValues((prev) => ({ ...prev, [field]: value }));
    };
    const ownerErrors = validateUserForm('super_admin', 'register', ownerValues);
    const isOwnerStepValid = !isPrimaryRegistration || !hasErrors(ownerErrors);

    const [planForm, setPlanForm] = useState<PlanStepForm>(EMPTY_PLAN_FORM);
    const setPlanField = (name: keyof PlanStepForm) => (value: string | number) => {
        setPlanForm((prev) => ({ ...prev, [name]: value }));
    };
    const isPlanStepValid = isPrimaryRegistration ? Boolean(planForm.plan_public_id) : Boolean(sourceCompanyPublicId);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dirección de la última navegación — la página la usa para animar el paso entrante desde
    // la derecha (avanzar) o desde la izquierda (retroceder), efecto de hoja de libro.
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const totalSteps = isPrimaryRegistration ? 3 : 2;
    const isCurrentStepValid = step === 1 ? isCompanyStepValid : step === 2 && isPrimaryRegistration ? isOwnerStepValid : isPlanStepValid;

    // Los errores por campo recién se pintan cuando se intenta avanzar con el paso incompleto.
    const [showErrors, setShowErrors] = useState(false);

    /** Avanza de paso; si el paso actual está incompleto no avanza y muestra el error de cada campo que falta. */
    const goNext = () => {
        if (!isCurrentStepValid) {
            setShowErrors(true);
            toast.error('Completa los campos obligatorios para continuar');
            return;
        }
        setShowErrors(false);
        setDirection('forward');
        setStep((prev) => (prev < totalSteps ? ((prev + 1) as 1 | 2 | 3) : prev));
    };

    const goBack = () => {
        setShowErrors(false);
        setDirection('backward');
        setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    };

    // System contrata un plan; el resto selecciona su grupo y hereda la suscripción.
    const handleRegister = async () => {
        if (!isCompanyStepValid || !isOwnerStepValid || !isPlanStepValid) {
            setShowErrors(true);
            toast.error('Completa los datos de la empresa, el dueño y la suscripción');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await CompanyService.register({
                company: companyForm,
                ...(isPrimaryRegistration ? { owner: toUserPayload('super_admin', 'register', ownerValues), plan: planForm } : { source_company_public_id: sourceCompanyPublicId }),
            });
            toast.success(result.message);
            navigate('/companys');
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step, totalSteps, direction, goNext, goBack,
        isPrimaryRegistration, sourceCompanies, sourceCompanyPublicId, setSourceCompany,
        companyForm, setCompanyField, companyErrors: showErrors ? companyErrors : {},
        ownerValues, setOwnerField, ownerErrors: showErrors ? ownerErrors : {},
        planForm, setPlanField, isPlanStepValid,
        countryOptions, plans,
        departments, provinces, districts, departmentId, provinceId,
        selectCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        isSubmitting, handleRegister,
    };
};

export default useRegisterCompany;
