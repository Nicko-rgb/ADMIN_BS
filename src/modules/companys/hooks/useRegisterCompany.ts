import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import toast from '../../../shared/utils/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import CompanyService from '../service/companyService';
import useCompanyFormFields from './useCompanyFormFields';
import useOwnerFormFields from './useOwnerFormFields';
import type { DocumentType } from '../../users/interfaces/user.interface';
import type { PlanStepForm } from '../interfaces/companyRegistration.interface';

const EMPTY_PLAN_FORM: PlanStepForm = {
    plan_id: 0,
    billing_period: 'monthly',
};

/**
 * Wizard de alta de empresa — 3 pasos (empresa, dueño, plan) en un solo hook. Los pasos
 * "empresa" y "dueño" reusan useCompanyFormFields/useOwnerFormFields (mismo estado que la
 * edición individual de cada uno usa en useCompany), acá solo se agrega el paso "plan" y el
 * envío final (transacción completa en el backend).
 */
export const useRegisterCompany = () => {
    const navigate = useNavigate();
    const { countries, loadCountries, plans, loadPlans } = useCatalogActive();

    useEffect(() => { loadCountries(); loadPlans(); }, [loadCountries, loadPlans]);
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    const [step, setStep] = useState<1 | 2 | 3>(1);

    const {
        companyForm, setCompanyField, isCompanyStepValid,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
    } = useCompanyFormFields();

    const { ownerForm, setOwnerField, isOwnerStepValid } = useOwnerFormFields(true);

    const [planForm, setPlanForm] = useState<PlanStepForm>(EMPTY_PLAN_FORM);
    const setPlanField = (name: keyof PlanStepForm) => (value: string | number) => {
        setPlanForm((prev) => ({ ...prev, [name]: value }));
    };
    const isPlanStepValid = Boolean(planForm.plan_id);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dirección de la última navegación — la página la usa para animar el paso entrante desde
    // la derecha (avanzar) o desde la izquierda (retroceder), efecto de hoja de libro.
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const goNext = () => {
        setDirection('forward');
        setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    };

    const goBack = () => {
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
                owner: { ...ownerForm, document_type: ownerForm.document_type as DocumentType },
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
        companyForm, setCompanyField, isCompanyStepValid,
        ownerForm, setOwnerField, isOwnerStepValid,
        planForm, setPlanField, isPlanStepValid,
        countryOptions, plans,
        departments, provinces, districts, departmentId, provinceId,
        selectCompanyCountry, selectDepartment, selectProvince, selectDistrict, isLoadingUbigeo,
        isSubmitting, handleRegister,
    };
};

export default useRegisterCompany;
