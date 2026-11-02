import { useEffect, useState } from 'react';
import UserService from '../service/userService';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import type { UserDetail } from '../interfaces/user.interface';

/** Obtiene la información de cuenta del usuario autenticado para su vista de perfil. */
export const useProfile = () => {
    const [profile, setProfile] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        UserService.getOwnProfile()
            .then((detail) => { if (active) setProfile(detail); })
            .catch((err) => { if (active) toast.error(handleApiError(err)); })
            .finally(() => { if (active) setIsLoading(false); });

        return () => { active = false; };
    }, []);

    return { profile, isLoading };
};

export default useProfile;
