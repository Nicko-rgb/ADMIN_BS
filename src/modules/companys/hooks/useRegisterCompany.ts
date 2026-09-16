import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import toast from '../../../shared/utils/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import CompanyService from '../service/companyService';
import useCompanyFormFields from './useCompanyFormFields';
import { hasErrors } from '../../../shared/utils/formErrors';
import { createEmptyUserForm, toUserPayload, validateUserForm } from '../../users/utils/userForm';
import type { PlanStepForm } from '../interfaces/companyRegistration.interface';
import type { UserFormValues } from '../../users/interfaces/user.interface';

const EMPTY_PLAN_FORM: PlanStepForm = {
    plan_id: 0,
    billing_period: 'monthly',
};

/**
 * Wizard de alta de empresa — 3 pasos (empresa, dueño, plan) en un solo hook. El paso "empresa"
 * reusa useCompanyFormFields (mismo estado que la edición de empresa en useCompany); el paso
 * "dueño" usa los helpers de FormUserManage con rol super_admin en modo alta. El envío final es
 * una sola transacción en el backend.
 */
export const useRegisterCompany = () => {
    const navigate = useNavigate();
    const { countries, loadCountries, plans, loadPlans } = useCatalogActive();

    useEffect(() => { loadCountries(); loadPlans(); }, [loadCountries, loadPlans]);
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    const [step, setStep] = useState<1 | 2 | 3>(1);

    const {
        companyForm, setCompanyField, companyErrors, isCompanyStepValid,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
    } = useCompanyFormFields();

    const [ownerValues, setOwnerValues] = useState<UserFormValues>(() => createEmptyUserForm('super_admin'));
    const setOwnerField = <K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) => {
        setOwnerValues((prev) => ({ ...prev, [field]: value }));
    };
    const ownerErrors = validateUserForm('super_admin', 'register', ownerValues);
    const isOwnerStepValid = !hasErrors(ownerErrors);

    const [planForm, setPlanForm] = useState<PlanStepForm>(EMPTY_PLAN_FORM);
    const setPlanField = (name: keyof PlanStepForm) => (value: string | number) => {
        setPlanForm((prev) => ({ ...prev, [name]: value }));
    };
    const isPlanStepValid = Boolean(planForm.plan_id);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dirección de la última navegación — la página la usa para animar el paso entrante desde
    // la derecha (avanzar) o desde la izquierda (retroceder), efecto de hoja de libro.
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const isCurrentStepValid = step === 1 ? isCompanyStepValid : step === 2 ? isOwnerStepValid : isPlanStepValid;

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
        setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    };

    const goBack = () => {
        setShowErrors(false);
        setDirection('backward');
        setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
    };

    // Alta de empresa — crea Company+User+Person+UserCompany+SaaSSubscription ya activa en el
    // backend (una transacción, ver company.service.ts → register).
    const handleRegister = async () => {
        setIsSubmitting(true);
        try {
            const result = await CompanyService.register({
                company: companyForm,
                owner: toUserPayload('super_admin', 'register', ownerValues),
                plan: planForm,
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
        step, direction, goNext, goBack,
        companyForm, setCompanyField, companyErrors: showErrors ? companyErrors : {},
        ownerValues, setOwnerField, ownerErrors: showErrors ? ownerErrors : {},
        planForm, setPlanField, isPlanStepValid,
        countryOptions, plans,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        isSubmitting, handleRegister,
    };
};

export default useRegisterCompany;
