import { useCallback, useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { useCompanyContextStore } from '../../../shared/store/sessionStore';
import { usePageHeader } from '../../../shared/store/headerStore';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import PlanUsageService from '../service/planUsageService';
import { getPlanUsageAlerts } from '../utils/planUsage';
import { resolveSubscriptionState } from '../utils/subscriptionStatus';
import type { PlanUsageOverview } from '../interfaces/planUsage.interface';

const formatDate = (date: string | null): string => {
    if (!date) return 'Sin fecha definida';
    return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
};

export const useUsage = () => {
    const companies = useCompanyContextStore((state) => state.companies);
    const companyPublicId = (companies.find((company) => company.isPrimary && company.publicId)
        ?? companies.find((company) => company.publicId))?.publicId;
    const [reloadToken, setReloadToken] = useState(0);
    const [result, setResult] = useState<{
        companyPublicId?: string;
        requestKey: string;
        data: PlanUsageOverview | null;
        error: string;
    }>({ requestKey: '', data: null, error: '' });
    const requestKey = `${companyPublicId ?? ''}:${reloadToken}`;

    usePageHeader({
        title: 'Uso de mi plan',
        subtitle: 'Conoce tu capacidad disponible y anticipa lo que tu empresa necesita.',
        icon: Gauge,
        breadcrumbs: [{ label: 'Uso del plan' }],
    });

    useEffect(() => {
        if (!companyPublicId) return;
        let isCurrent = true;
        PlanUsageService.getOverview(companyPublicId)
            .then((data) => {
                if (isCurrent) setResult({ companyPublicId, requestKey, data, error: '' });
            })
            .catch((err: unknown) => {
                if (!isCurrent) return;
                const error = handleApiError(err);
                setResult({ companyPublicId, requestKey, data: null, error });
                toast.error(error);
            });
        return () => { isCurrent = false; };
    }, [companyPublicId, requestKey]);

    const reload = useCallback(() => setReloadToken((value) => value + 1), []);
    const data = companyPublicId && result.companyPublicId === companyPublicId ? result.data : null;
    const isLoading = Boolean(companyPublicId) && result.requestKey !== requestKey;
    const error = result.requestKey === requestKey ? result.error : '';
    const plan = data?.subscription.plan;
    const features = plan ? [
        { label: 'Multiempresa', detail: 'Varias empresas bajo una suscripción', included: plan.allowsMultiCompany },
        { label: 'Reportes avanzados', detail: 'Análisis ampliado de tu operación', included: plan.hasAdvancedReports },
        { label: 'Stripe Connect', detail: 'Integración de pagos incluida en el plan', included: plan.hasStripeConnect },
        { label: 'Notificaciones', detail: plan.notificationsTier === 'full' ? 'Todos los canales incluidos' : 'Correo electrónico', included: true },
    ] : [];
    const additionalFeatures = Array.isArray(plan?.features)
        ? [...new Set(plan.features.filter((feature): feature is string => typeof feature === 'string' && Boolean(feature.trim())))]
        : [];

    return {
        companyPublicId, data, isLoading, error, reload, features, additionalFeatures,
        alerts: data ? getPlanUsageAlerts(data) : [],
        subscriptionState: data ? resolveSubscriptionState(data.subscription) : null,
        periodStart: formatDate(data?.subscription.currentPeriodStart ?? null),
        periodEnd: formatDate(data?.subscription.currentPeriodEnd ?? null),
        updatedAt: data ? new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(data.updatedAt)) : '',
        branchCount: data?.companyUsage.reduce((count, company) => count + company.branches.length, 0) ?? 0,
        spaceCount: data?.companyUsage.reduce((count, company) => count + company.branches.reduce((sum, branch) => sum + branch.spaces.used, 0), 0) ?? 0,
    };
};
