import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../service/userService';
import SubscriptionService from '../../saas/service/subscriptionService';
import type { CompanySubscription } from '../../saas/interfaces/subscription.interface';
import { resolveSubscriptionState } from '../../saas/utils/subscriptionStatus';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import { useCompanyContextStore, useSessionStore } from '../../../shared/store/sessionStore';
import { usePermission } from '../../../shared/hooks/usePermission';
import { formatDate, formatDateText } from '../../../shared/utils/formatDate';
import { DOCUMENT_TYPE_LABELS, ROLE_LABELS } from '../utils/userConstants';
import type { DocumentType, ManagedRole, UpdateOwnProfilePayload, UserDetail } from '../interfaces/user.interface';

const BILLING_PERIOD_LABELS: Record<string, string> = { monthly: 'Mensual', yearly: 'Anual' };
const profileName = (profile: UserDetail) => [profile.firstName, profile.lastName].filter(Boolean).join(' ');
const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

/**
 * Datos de la vista de perfil: cuenta del usuario autenticado + suscripción de su
 * empresa. `companyPublicId` debe ser una empresa raíz (nunca una sucursal) y es
 * opcional: sin él (ej. alcance `system`, que no tiene empresas en el contexto) la
 * suscripción queda vacía sin disparar request.
 */
export const useProfile = () => {
    const can = usePermission();
    const navigate = useNavigate();
    const scopeLevel = useSessionStore((state) => state.scopeLevel);
    const companies = useCompanyContextStore((state) => state.companies);
    const subscriptionCompany = companies.find((company) => company.isPrimary) ?? companies[0];
    const companyPublicId = subscriptionCompany?.publicId;
    // Perfil
    const [profile, setProfile] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Suscripción
    const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState(Boolean(companyPublicId));
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isPasswordFogetOpen, setPasswordFogetOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editForm, setEditForm] = useState<Required<UpdateOwnProfilePayload> | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const detail = await UserService.getOwnProfile();
            setProfile(detail);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSubscription = useCallback(async ({ companyPublicId: companyId }: { companyPublicId: string }) => {
        setIsLoadingSubscription(true);
        try {
            const data = await SubscriptionService.getByCompanyPublicId(companyId);
            setSubscription(data);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsLoadingSubscription(false);
        }
    }, [companyPublicId]);

    const updateProfile = useCallback(async (payload: UpdateOwnProfilePayload): Promise<boolean> => {
        setIsSavingProfile(true);
        try {
            const result = await UserService.updateOwnProfile(payload);
            setProfile(result.data);
            toast.success(result.message);
            return true;
        } catch (err) {
            toast.error(handleApiError(err));
            return false;
        } finally {
            setIsSavingProfile(false);
        }
    }, []);

    const openEditProfile = () => {
        if (!profile) return;
        setEditForm({
            first_name: profile.firstName ?? '',
            last_name: profile.lastName ?? '',
            email: profile.email ?? '',
            phone: profile.phone,
            country_id: profile.countryId ?? 0,
            document_type: profile.documentType,
            document_number: profile.documentNumber,
            date_birth: profile.dateBirth,
        });
        setIsEditProfileOpen(true);
    };

    const closeEditProfile = () => {
        if (isSavingProfile) return;
        setIsEditProfileOpen(false);
        setEditForm(null);
    };

    const openPasswordReset = () => setPasswordFogetOpen(true);
    const closePasswordReset = () => setPasswordFogetOpen(false);

    const setEditField = (name: keyof UpdateOwnProfilePayload) => (value: string | number | boolean | null) => {
        setEditForm((current) => current ? { ...current, [name]: value } : current);
    };

    const submitEditProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editForm) return;
        if (await updateProfile(editForm)) {
            setIsEditProfileOpen(false);
            setEditForm(null);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (!companyPublicId) {
            setSubscription(null);
            setIsLoadingSubscription(false);
            return;
        }
        fetchSubscription({ companyPublicId });
    }, [fetchSubscription, companyPublicId]);


    return {
        canReadProfile: can('user.profile_view'),
        scopeLevel,
        companies,
        profile,
        isLoading,
        subscription,
        subscriptionState: subscription ? resolveSubscriptionState(subscription) : null,
        nextInvoiceLabel: subscription ? formatDate(subscription.nextInvoiceAt ?? subscription.currentPeriodEnd) : '—',
        billingPeriodLabel: subscription ? BILLING_PERIOD_LABELS[subscription.billingPeriod ?? ''] ?? '—' : '—',
        name: profile ? profileName(profile) : '',
        initials: profile ? initials(profileName(profile)) : '',
        roleLabel: profile ? ROLE_LABELS[profile.role as ManagedRole] ?? profile.role : '',
        documentLabel: profile?.documentType ? DOCUMENT_TYPE_LABELS[profile.documentType as DocumentType] : null,
        birthDateLabel: profile ? formatDateText(profile.dateBirth) : '—',
        isLoadingSubscription,
        isSavingProfile,
        updateProfile,
        isPasswordFogetOpen,
        openPasswordReset,
        closePasswordReset,
        isEditProfileOpen,
        editForm,
        openEditProfile,
        closeEditProfile,
        setEditField,
        submitEditProfile,
        navigateToSubscriptions: () => navigate('/saas/suscripciones'),
    };
};

export default useProfile;
