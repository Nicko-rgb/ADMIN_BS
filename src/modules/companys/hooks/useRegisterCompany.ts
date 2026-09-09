import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import toast from '../../../shared/utils/toast';
import { handleApiError } from '../../../shared/utils/errorHandler';
import CompanyService from '../service/companyService';
import type { UbigeoNode } from '../../system/interfaces/catalog.interface';
import type { DocumentType } from '../../users/interfaces/user.interface';
import type { CompanyStepForm, OwnerStepForm, PlanStepForm } from '../interfaces/companyRegistration.interface';

const EMPTY_COMPANY_FORM: CompanyStepForm = {
    name: '',
    document: '',
    country_id: 0,
    ubigeo_id: 0,
    address: '',
    phone_cell: '',
    phone: '',
    website: '',
};

const EMPTY_OWNER_FORM: OwnerStepForm = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    country_id: 0,
    document_type: '',
    document_number: '',
    date_birth: '',
};

const EMPTY_PLAN_FORM: PlanStepForm = {
    plan_id: 0,
    billing_period: 'monthly',
};

/**
 * Wizard de alta de empresa — 3 pasos (empresa, dueño, plan) en un solo hook. La ubicación de
 * la empresa se arma con una cascada departamento → provincia → distrito (`loadUbigeoChildren`
 * de useCatalogActive) porque `ubigeo_id` debe ser puntualmente un distrito (nivel 3), no
 * cualquier nodo del árbol.
 */
export const useRegisterCompany = () => {
    const navigate = useNavigate();
    const { countries, plans, loadUbigeoChildren } = useCatalogActive();
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    const [step, setStep] = useState<1 | 2 | 3>(3);

    const [companyForm, setCompanyForm] = useState<CompanyStepForm>(EMPTY_COMPANY_FORM);
    const [ownerForm, setOwnerForm] = useState<OwnerStepForm>(EMPTY_OWNER_FORM);
    const [planForm, setPlanForm] = useState<PlanStepForm>(EMPTY_PLAN_FORM);

    // Cascada de ubicación — cada nivel se resetea cuando cambia el de arriba.
    const [departments, setDepartments] = useState<UbigeoNode[]>([]);
    const [provinces, setProvinces] = useState<UbigeoNode[]>([]);
    const [districts, setDistricts] = useState<UbigeoNode[]>([]);
    const [departmentId, setDepartmentId] = useState(0);
    const [provinceId, setProvinceId] = useState(0);
    const [isLoadingUbigeo, setIsLoadingUbigeo] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const setCompanyField = (name: keyof CompanyStepForm) => (value: string | number | boolean) => {
        setCompanyForm((prev) => ({ ...prev, [name]: value }));
    };

    const setOwnerField = (name: keyof OwnerStepForm) => (value: string | number) => {
        setOwnerForm((prev) => ({ ...prev, [name]: value }));
    };

    const setPlanField = (name: keyof PlanStepForm) => (value: string | number) => {
        setPlanForm((prev) => ({ ...prev, [name]: value }));
    };

    // País de la empresa → primer nivel de la cascada de ubicación (departamento).
    const selectCompanyCountry = async (countryId: number) => {
        setCompanyForm((prev) => ({ ...prev, country_id: countryId, ubigeo_id: 0 }));
        setDepartmentId(0);
        setProvinceId(0);
        setProvinces([]);
        setDistricts([]);

        if (!countryId) {
            setDepartments([]);
            return;
        }

        setIsLoadingUbigeo(true);
        try {
            setDepartments(await loadUbigeoChildren({ countryId }));
        } finally {
            setIsLoadingUbigeo(false);
        }
    };

    const selectDepartment = async (id: number) => {
        setDepartmentId(id);
        setProvinceId(0);
        setDistricts([]);
        setCompanyForm((prev) => ({ ...prev, ubigeo_id: 0 }));

        if (!id) {
            setProvinces([]);
            return;
        }

        setIsLoadingUbigeo(true);
        try {
            setProvinces(await loadUbigeoChildren({ parentId: id }));
        } finally {
            setIsLoadingUbigeo(false);
        }
    };

    const selectProvince = async (id: number) => {
        setProvinceId(id);
        setCompanyForm((prev) => ({ ...prev, ubigeo_id: 0 }));

        if (!id) {
            setDistricts([]);
            return;
        }

        setIsLoadingUbigeo(true);
        try {
            setDistricts(await loadUbigeoChildren({ parentId: id }));
        } finally {
            setIsLoadingUbigeo(false);
        }
    };

    const selectDistrict = (id: number) => {
        setCompanyForm((prev) => ({ ...prev, ubigeo_id: id }));
    };

    // Validación mínima por paso — habilita "Siguiente" recién con lo indispensable cargado.
    const isCompanyStepValid = Boolean(
        companyForm.name.trim() && companyForm.document.trim() && companyForm.phone_cell.trim()
        && companyForm.address.trim() && companyForm.country_id && companyForm.ubigeo_id
    );

    const isOwnerStepValid = Boolean(
        ownerForm.first_name.trim() && ownerForm.last_name.trim() && ownerForm.password.trim()
        && ownerForm.phone.trim() && ownerForm.country_id && ownerForm.document_type && ownerForm.document_number.trim()
    );

    const isPlanStepValid = Boolean(planForm.plan_id);

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

    // Alta de empresa — crea Company+User+Person+UserCompany+permisos+SaaSSubscription en el
    // backend (una transacción, ver company.service.ts → register), pendiente de pago hasta
    // que el dueño autorice el link de MercadoPago que se le manda por correo.
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
