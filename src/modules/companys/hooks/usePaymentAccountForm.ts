import { useEffect, useRef, useState, type FormEvent } from 'react';
import { resolveImageUrl } from '../../../shared/utils/formatText';
import PaymentConfigService from '../service/paymentConfigService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import type { ManualPaymentAccount, ManualPaymentAccountFormValues } from '../interfaces/paymentConfig.interface';

const emptyForm = (): ManualPaymentAccountFormValues => ({ account_alias: '', account_name: '', account_number: '', bank_name: '' });
const toForm = (account: ManualPaymentAccount | null): ManualPaymentAccountFormValues => ({
    account_alias: account?.account_alias ?? '', account_name: account?.account_name ?? '',
    account_number: account?.account_number ?? '', bank_name: account?.bank_name ?? '',
});

export default function usePaymentAccountForm(branchId: string, type: PaymentType, onChanged: () => void) {
    const [savedAccount, setSavedAccount] = useState<ManualPaymentAccount | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [savedQrUrl, setSavedQrUrl] = useState<string | null>(null);
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [removeQr, setRemoveQr] = useState(false);
    const [qrError, setQrError] = useState('');
    const previewRef = useRef<string | null>(null);
    useEffect(() => () => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    }, []);
    const clearQrSelection = () => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
        setQrFile(null);
        setQrPreview(null);
        setQrError('');
        setRemoveQr(false);
    };
    const pickQr = (file: File | null) => {
        if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) {
            setQrError('Seleccioná una imagen PNG, JPG o WebP de hasta 5 MB.');
            return;
        }
        clearQrSelection();
        previewRef.current = URL.createObjectURL(file);
        setQrPreview(previewRef.current);
        setQrFile(file);
    };
    const discardQr = () => {
        clearQrSelection();
        setRemoveQr(Boolean(savedQrUrl));
    };
    const [exists, setExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ManualPaymentAccountFormValues, string>>>({});
    const pending = useRef(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const account = await PaymentConfigService.getManualAccount(branchId, type.id);
                if (!active) return;
                setSavedAccount(account);
                setIsEditing(account === null);
                setForm(toForm(account));
                setSavedQrUrl(account?.qr?.url ?? account?.qr_url ?? null);
                setExists(account !== null);
            } catch (err) {
                if (active) setError(handleApiError(err));
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, [branchId, type.id, reload]);

    const setField = (key: keyof ManualPaymentAccountFormValues, value: string) => {
        setForm((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (pending.current || loading || error) return;
        const value = { ...form };
        for (const key of Object.keys(value) as (keyof typeof value)[]) value[key] = value[key].trim();
        const nextErrors: typeof errors = {};
        if (!value.account_name) nextErrors.account_name = 'Ingresá el nombre del titular.';
        if (!value.account_number) nextErrors.account_number = 'Ingresá el teléfono o número de cuenta.';
        if (type.code.trim().toUpperCase() === 'PLIN' && !/^9\d{8}$/.test(value.account_number)) {
            nextErrors.account_number = 'Ingresá un celular válido.';
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        pending.current = true;
        setBusy('save');
        try {
            const account = await PaymentConfigService.saveManualAccount(branchId, type.id, value, qrFile, removeQr);
            setSavedAccount(account);
            setIsEditing(false);
            setForm(toForm(account));
            setSavedQrUrl(account.qr?.url ?? account.qr_url);
            clearQrSelection();
            setExists(true);
            setConfirmDelete(false);
            toast.success('Cuenta guardada');
            onChanged();
        } catch (err) { toast.error(handleApiError(err)); }
        finally { pending.current = false; setBusy(null); }
    };
    const remove = async () => {
        if (pending.current || !exists) return;
        pending.current = true;
        setBusy('delete');
        try {
            await PaymentConfigService.deleteManualAccount(branchId, type.id);
            setSavedAccount(null);
            setIsEditing(true);
            setForm(emptyForm());
            setSavedQrUrl(null);
            clearQrSelection();
            setExists(false);
            setErrors({});
            setConfirmDelete(false);
            toast.success('Cuenta eliminada');
            onChanged();
        } catch (err) { toast.error(handleApiError(err)); }
        finally { pending.current = false; setBusy(null); }
    };
    const startEditing = () => {
        setForm(toForm(savedAccount));
        clearQrSelection();
        setErrors({});
        setConfirmDelete(false);
        setIsEditing(true);
    };
    const cancelEditing = () => {
        setForm(toForm(savedAccount));
        clearQrSelection();
        setErrors({});
        setConfirmDelete(false);
        setIsEditing(false);
    };
    const previewUrl = qrPreview ?? (!removeQr && savedQrUrl ? resolveImageUrl(savedQrUrl) : null);
    return { savedAccount, isEditing, startEditing, cancelEditing, previewUrl, qrFile, qrError, removeQr, pickQr, discardQr, clearQrSelection,
        form, exists, loading, error, busy, errors, setField, submit, remove,
        retry: () => setReload((value) => value + 1), confirmDelete, setConfirmDelete };
}
