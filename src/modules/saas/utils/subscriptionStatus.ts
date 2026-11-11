import type { CompanySubscription, SubscriptionStatus } from '../interfaces/subscription.interface';

export type SubscriptionTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

interface SubscriptionState {
    label: string;
    tone: SubscriptionTone;
}

/**
 * Muestra el estado comercial tal como lo devuelve el backend.
 * La vigencia se muestra por separado mediante `isEffective`.
 */
export const resolveSubscriptionState = (subscription: CompanySubscription): SubscriptionState => {
    const states: Record<SubscriptionStatus, SubscriptionState> = {
        PENDING: { label: 'Pendiente de pago', tone: 'warning' },
        TRIAL: { label: 'En prueba', tone: 'info' },
        ACTIVE: { label: 'Activa', tone: 'success' },
        PAST_DUE: { label: 'Vencida', tone: 'danger' },
        CANCELED: { label: 'Cancelada', tone: 'neutral' },
        INCOMPLETE: { label: 'Pago incompleto', tone: 'warning' },
    };

    return states[subscription.status] ?? { label: subscription.status, tone: 'neutral' };
};
