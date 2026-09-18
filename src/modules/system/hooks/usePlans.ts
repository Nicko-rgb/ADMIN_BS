import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import PlanService from '../service/planService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import type { Plan } from '../../../shared/interfaces/catalog.interface';
import type { UpdatePlanPayload } from '../interfaces/catalog.interface';

// Estado del formulario de edición — claves iguales al payload de escritura (snake_case).
const toEditForm = (plan: Plan): Required<UpdatePlanPayload> => ({
    name: plan.name,
    code: plan.code,
    price_monthly: plan.priceMonthly,
    price_yearly: plan.priceYearly,
    max_subsidiaries: plan.maxSubsidiaries,
    max_spaces: plan.maxSpaces,
    max_users: plan.maxUsers,
    has_stripe_connect: plan.hasStripeConnect,
    max_invoices_monthly: plan.maxInvoicesMonthly,
    notifications_tier: plan.notificationsTier,
    has_advanced_reports: plan.hasAdvancedReports,
    allows_multi_company: plan.allowsMultiCompany,
    is_active: plan.isActive,
    features: plan.features,
});

/** Listado de planes SaaS (búsqueda/filtro/paginación en el front) + edición (incluye características): todo se maneja íntegramente acá. */
export const usePlans = () => {
    const [items, setItems] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<Required<UpdatePlanPayload> | null>(null);
    const [newFeature, setNewFeature] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchPlans = async () => {
            try {
                const items = await PlanService.list();
                if (active) setItems(items);
            } catch (err) {
                if (active) toast.error(handleApiError(err));
            } finally {
                if (active) setIsLoading(false);
            }
        };

        fetchPlans();

        return () => { active = false; };
    }, [reloadToken]);

    const reload = () => {
        setIsLoading(true);
        setReloadToken((token) => token + 1);
    };

    const openEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setForm(toEditForm(plan));
        setNewFeature('');
    };

    const closeEdit = () => {
        setEditingId(null);
        setForm(null);
        setNewFeature('');
    };

    const setField = (name: keyof UpdatePlanPayload) => (value: string | number | boolean) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const addFeature = () => {
        const trimmed = newFeature.trim();
        if (!trimmed) return;

        setForm((prev) => (prev ? { ...prev, features: [...prev.features, trimmed] } : prev));
        setNewFeature('');
    };

    const removeFeature = (index: number) => {
        setForm((prev) => (prev ? { ...prev, features: prev.features.filter((_, i) => i !== index) } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingId === null || !form) return;

        setIsSaving(true);
        try {
            const result = await PlanService.update(editingId, form);
            toast.success(result.message);
            closeEdit();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const openDelete = (plan: Plan) => setDeletingPlan(plan);
    const closeDelete = () => setDeletingPlan(null);

    const confirmDelete = async () => {
        if (!deletingPlan) return;

        setIsDeleting(true);
        try {
            const result = await PlanService.delete(deletingPlan.id);
            toast.success(result.message);
            closeDelete();
            reload();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        items, isLoading,
        editingId, isEditOpen: editingId !== null, form, setField, openEdit, closeEdit, handleSubmit, isSaving,
        newFeature, setNewFeature, addFeature, removeFeature,
        deletingPlan, isDeleteOpen: deletingPlan !== null, openDelete, closeDelete, confirmDelete, isDeleting,
    };
};
