import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentConfigService from '../service/paymentConfigService';
import { getApiErrorStatus, handleApiError } from '../../../shared/utils/errorHandler';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import type { CompanyDetail, CompanySubsidiary } from '../interfaces/company.interface';
import type {
    PaymentConfigBranch,
    PaymentConfigErrorStatus,
    PaymentConfigStatus,
    PaymentTypesStatus,
} from '../interfaces/paymentConfig.interface';

/**
 * Estado de Configuración de pagos:
 *   1. Empresa (por `?company=publicId`).
 *   2. Sus sucursales — nodos del árbol.
 *   3. Tipos de pago del país de la sucursal seleccionada.
 *
 * El catálogo de tipos se cachea en memoria por `countryId`: dos sucursales
 * del mismo país comparten la respuesta y no vuelven a golpear el backend.
 * Cada request de tipos lleva un id para descartar respuestas viejas cuando
 * el usuario cambia de sucursal antes de que termine la anterior.
 *
 * `enabled` permite no pedir nada cuando el usuario no tiene el permiso de la
 * pantalla (la página muestra ForbiddenScreen).
 */
const usePaymentConfig = (enabled = true) => {
    const [searchParams] = useSearchParams();
    const companyPublicId = searchParams.get('company') ?? '';

    const { countries, loadCountries } = useCatalogActive();

    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [branches, setBranches] = useState<CompanySubsidiary[]>([]);
    const [isCompanyLoading, setIsCompanyLoading] = useState(enabled);
    const [errorStatus, setErrorStatus] = useState<PaymentConfigErrorStatus | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [branchesStatus, setBranchesStatus] = useState<PaymentConfigStatus>(enabled ? 'loading' : 'idle');
    const [branchesError, setBranchesError] = useState('');
    const [reloadToken, setReloadToken] = useState(0);

    const [selectedBranchPublicId, setSelectedBranchPublicId] = useState<string | null>(null);
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
    const [typesStatus, setTypesStatus] = useState<PaymentTypesStatus>('idle');
    const [typesError, setTypesError] = useState('');

    // Mercado Pago de la sucursal seleccionada: solo el estado (conectado o no).
    const [mpConnected, setMpConnected] = useState(false);
    const [mpStatus, setMpStatus] = useState<PaymentConfigStatus>('idle');
    const [mpError, setMpError] = useState('');

    const typesCache = useRef(new Map<number, PaymentType[]>());
    const typesRequestId = useRef(0);
    const mpRequestId = useRef(0);

    // Catálogo de países para mostrar nombre + bandera de cada sucursal. El hook
    // compartido cachea la respuesta por sesión, así que no es un request extra
    // si otra pantalla ya lo pidió.
    useEffect(() => {
        if (enabled) void loadCountries();
    }, [enabled, loadCountries]);

    useEffect(() => {
        if (!enabled || !companyPublicId) return;
        let active = true;

        const load = async () => {
            setIsCompanyLoading(true);
            setErrorStatus(null);
            setErrorMessage('');
            setBranches([]);
            setBranchesStatus('loading');
            setBranchesError('');
            setSelectedBranchPublicId(null);
            setPaymentTypes([]);
            setTypesStatus('idle');
            setTypesError('');
            setMpConnected(false);
            setMpStatus('idle');
            setMpError('');
            typesCache.current.clear();
            typesRequestId.current += 1;
            mpRequestId.current += 1;

            // Empresa y sucursales cargan en paralelo y fallan por separado: si
            // las sucursales fallan, la empresa igual se muestra y el árbol
            // ofrece reintentar.
            const [companyResult, branchesResult] = await Promise.allSettled([
                PaymentConfigService.getCompany(companyPublicId),
                PaymentConfigService.listBranches(companyPublicId),
            ]);
            if (!active) return;

            if (companyResult.status === 'fulfilled') {
                setCompany(companyResult.value);
            } else {
                const status = getApiErrorStatus(companyResult.reason);
                setErrorStatus(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
                setErrorMessage(handleApiError(companyResult.reason));
            }
            setIsCompanyLoading(false);

            if (branchesResult.status === 'fulfilled') {
                setBranches(branchesResult.value);
                setBranchesStatus('ready');
            } else {
                setBranchesStatus('error');
                setBranchesError(handleApiError(branchesResult.reason));
            }
        };

        void load();

        return () => { active = false; };
    }, [enabled, companyPublicId, reloadToken]);

    const loadTypes = useCallback(async (countryId: number, force = false) => {
        const cached = typesCache.current.get(countryId);
        if (cached && !force) {
            setPaymentTypes(cached);
            setTypesStatus('ready');
            setTypesError('');
            return;
        }

        const requestId = typesRequestId.current + 1;
        typesRequestId.current = requestId;
        setTypesStatus('loading');
        setTypesError('');

        try {
            const data = await PaymentConfigService.listPaymentTypesByCountry(countryId);
            if (requestId !== typesRequestId.current) return;
            typesCache.current.set(countryId, data);
            setPaymentTypes(data);
            setTypesStatus('ready');
        } catch (err) {
            if (requestId !== typesRequestId.current) return;
            setPaymentTypes([]);
            setTypesStatus('error');
            setTypesError(handleApiError(err));
        }
    }, []);

    const loadMercadoPagoStatus = useCallback(async (branchPublicId: string) => {
        const requestId = mpRequestId.current + 1;
        mpRequestId.current = requestId;
        setMpStatus('loading');
        setMpError('');

        try {
            const connected = await PaymentConfigService.getMercadoPagoStatus(branchPublicId);
            if (requestId !== mpRequestId.current) return;
            setMpConnected(connected);
            setMpStatus('ready');
        } catch (err) {
            if (requestId !== mpRequestId.current) return;
            setMpConnected(false);
            setMpStatus('error');
            setMpError(handleApiError(err));
        }
    }, []);

    // El estado se consulta al seleccionar sucursal, no al abrir el modal.
    useEffect(() => {
        if (!enabled || !selectedBranchPublicId) return;

        const load = async () => {
            await loadMercadoPagoStatus(selectedBranchPublicId);
        };

        void load();
    }, [enabled, selectedBranchPublicId, loadMercadoPagoStatus]);

    const selectBranch = useCallback((branch: CompanySubsidiary) => {
        setSelectedBranchPublicId(branch.publicId);
        setTypesError('');
        // El estado de la sucursal anterior no debe verse mientras carga la nueva.
        setMpConnected(false);
        setMpStatus('loading');
        setMpError('');

        if (branch.countryId == null) {
            typesRequestId.current += 1;
            setPaymentTypes([]);
            setTypesStatus('no_country');
            return;
        }

        void loadTypes(branch.countryId);
    }, [loadTypes]);

    const countryById = useMemo(
        () => new Map(countries.map((country) => [country.id, country])),
        [countries],
    );

    const branchNodes = useMemo<PaymentConfigBranch[]>(() => branches.map((branch) => {
        const country = branch.countryId != null ? countryById.get(branch.countryId) : undefined;
        return {
            ...branch,
            countryName: country?.country ?? null,
            countryFlagUrl: country?.flagUrl ?? null,
        };
    }), [branches, countryById]);

    const selectedBranch = useMemo(
        () => branchNodes.find((branch) => branch.publicId === selectedBranchPublicId) ?? null,
        [branchNodes, selectedBranchPublicId],
    );

    // Sin `?company=` no hay nada que pedir: se resuelve como recurso inexistente
    // sin tocar estado desde el efecto.
    const isMissingCompany = enabled && !companyPublicId;

    const retry = useCallback(() => setReloadToken((token) => token + 1), []);

    const retryTypes = useCallback(() => {
        if (selectedBranch?.countryId == null) return;
        void loadTypes(selectedBranch.countryId, true);
    }, [selectedBranch, loadTypes]);

    const reloadMercadoPago = useCallback(() => {
        if (selectedBranchPublicId) void loadMercadoPagoStatus(selectedBranchPublicId);
    }, [selectedBranchPublicId, loadMercadoPagoStatus]);

    return {
        companyPublicId,
        company,
        branches: branchNodes,
        isCompanyLoading: isMissingCompany ? false : isCompanyLoading,
        errorStatus: isMissingCompany ? 'not_found' : errorStatus,
        errorMessage: isMissingCompany ? 'No se indicó la empresa a configurar.' : errorMessage,
        branchesStatus: isMissingCompany ? 'idle' : branchesStatus,
        branchesError,
        selectedBranch,
        selectBranch,
        paymentTypes,
        typesStatus,
        typesError,
        mpConnected,
        mpStatus,
        mpError,
        reloadMercadoPago,
        retry,
        retryTypes,
    };
};

export default usePaymentConfig;
