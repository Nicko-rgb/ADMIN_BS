import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import UserService from '../service/userService';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import { useSessionStore } from '../../../shared/store/sessionStore';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { trimValues } from '../../../shared/utils/trimValues';
import toast from '../../../shared/utils/toast';
import type { UpdateOwnProfilePayload, UserDetail } from '../interfaces/user.interface';

const toProfileForm = (detail: UserDetail): Required<UpdateOwnProfilePayload> => ({
    first_name: detail.firstName ?? '',
    last_name: detail.lastName ?? '',
    email: detail.email ?? '',
    phone: detail.phone,
    country_id: detail.countryId ?? 0,
    document_type: detail.documentType,
    document_number: detail.documentNumber,
    date_birth: detail.dateBirth,
});

/**
 * Autoedición del propio perfil (`GET`/`PUT /api/users/me`, `user.profile_edit`) — sin id: siempre
 * es el usuario autenticado. Refresca el nombre/correo cacheados en la sesión al guardar (ver sessionStore).
 */
export const useProfile = () => {
    const { countries, loadCountries } = useCatalogActive();
    const updateSessionUser = useSessionStore((state) => state.updateUser);

    const [form, setForm] = useState<Required<UpdateOwnProfilePayload> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { loadCountries(); }, [loadCountries]);
    const countryOptions = countries.map((country) => ({ value: country.id, label: country.country }));

    useEffect(() => {
        let active = true;

        UserService.getOwnProfile()
            .then((detail) => { if (active) setForm(toProfileForm(detail)); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); })
            .finally(() => { if (active) setIsLoading(false); });

        return () => { active = false; };
    }, []);

    const setField = (name: keyof UpdateOwnProfilePayload) => (value: string | number | boolean | null) => {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form) return;

        setIsSaving(true);
        try {
            const result = await UserService.updateOwnProfile(trimValues(form));
            setForm(toProfileForm(result.data));
            updateSessionUser({ firstName: result.data.firstName, lastName: result.data.lastName, email: result.data.email });
            toast.success(result.message);
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return { form, isLoading, isSaving, setField, handleSubmit, countryOptions };
};

export default useProfile;
