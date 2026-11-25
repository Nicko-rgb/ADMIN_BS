import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentConfigService from '../service/paymentConfigService';
import ContextService from '../../../shared/service/contextService';
import { getApiErrorStatus, handleApiError } from '../../../shared/utils/errorHandler';
import { useCatalogActive } from '../../../shared/hooks/useCatalogActive';
import type { PaymentType } from '../../../shared/interfaces/catalog.interface';
import type { ContextCompany, ContextSucursal } from '../../../shared/interfaces/session.interface';
import type {
    ManualPaymentAccount,
    PaymentConfigBranch,
    PaymentConfigCompany,
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

    const [companyNode, setCompanyNode] = useState<ContextCompany | null>(null);
    const [branches, setBranches] = useState<ContextSucursal[]>([]);
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

    const [manualAccounts, setManualAccounts] = useState<ManualPaymentAccount[]>([]);
    const [accountsStatus, setAccountsStatus] = useState<PaymentConfigStatus>('idle');
    const [accountsError, setAccountsError] = useState('');
    const [accountsReload, setAccountsReload] = useState(0);

    useEffect(() => {
        if (!enabled || !selectedBranchPublicId) return;
        let active = true;
        const load = async () => {
            setAccountsStatus('loading');
            setAccountsError('');
            setManualAccounts([]);
            try {
                const accounts = await PaymentConfigService.listManualAccounts(selectedBranchPublicId);
                if (!active) return;
                setManualAccounts(accounts);
                setAccountsStatus('ready');
            } catch (err) {
                if (!active) return;
                setAccountsStatus('error');
                setAccountsError(handleApiError(err));
            }
        };
        void load();
        return () => { active = false; };
    }, [enabled, selectedBranchPublicId, accountsReload]);
    const reloadManualAccounts = useCallback(() => setAccountsReload((value) => value + 1), []);

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
            setCompanyNode(null);
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

            // El árbol es la única fuente: empresa + sucursales en un solo request.
            // `access` lo calcula el backend; acá se descarta lo que no está en
            // alcance (empresa sin acceso → forbidden, sucursales sin acceso → no se listan).
            try {
                const tree = await ContextService.getContext(companyPublicId);
                if (!active) return;

                const node = tree.companies.find((company) => company.publicId === companyPublicId);
                if (!node) {
                    setErrorStatus('not_found');
                    setErrorMessage('La empresa que buscás no existe.');
                    setBranchesStatus('idle');
                    return;
                }
                if (!node.access) {
                    setErrorStatus('forbidden');
                    setErrorMessage('No tenés acceso a esta empresa.');
                    setBranchesStatus('idle');
                    return;
                }

                setCompanyNode(node);
                setBranches(node.sucursales);
                setBranchesStatus('ready');
            } catch (err) {
                if (!active) return;
                const message = handleApiError(err);
                const status = getApiErrorStatus(err);
                setErrorStatus(status === 404 ? 'not_found' : status === 403 ? 'forbidden' : 'unknown');
                setErrorMessage(message);
                setBranchesStatus('error');
                setBranchesError(message);
            } finally {
                if (active) setIsCompanyLoading(false);
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

    const selectBranch = useCallback((branch: PaymentConfigBranch) => {
        setSelectedBranchPublicId(branch.publicId);
        if (branch.publicId !== selectedBranchPublicId) {
            setManualAccounts([]);
            setAccountsStatus('loading');
            setAccountsError('');
        }
        setTypesError('');
        // El estado de la sucursal anterior no debe verse mientras carga la nueva.
        setMpConnected(false);
        setMpStatus(branch.supportsMercadoPago ? 'loading' : 'idle');
        setMpError('');

        if (branch.countryId == null) {
            typesRequestId.current += 1;
            setPaymentTypes([]);
            setTypesStatus('no_country');
            return;
        }

        void loadTypes(branch.countryId);
    }, [loadTypes, selectedBranchPublicId]);

    const countryById = useMemo(
        () => new Map(countries.map((country) => [country.id, country])),
        [countries],
    );

    const company = useMemo<PaymentConfigCompany | null>(() => {
        if (!companyNode) return null;
        const country = companyNode.countryId != null ? countryById.get(companyNode.countryId) : undefined;
        return {
            publicId: companyNode.publicId,
            name: companyNode.name,
            country: country ? { name: country.country, flagUrl: country.flagUrl } : null,
        };
    }, [companyNode, countryById]);

    // Solo sucursales en alcance: las que el backend marca `access: false` no se listan.
    const branchNodes = useMemo<PaymentConfigBranch[]>(() => branches
        .filter((branch) => branch.access)
        .map((branch) => {
            const country = branch.countryId != null ? countryById.get(branch.countryId) : undefined;
            return {
                publicId: branch.publicId,
                name: branch.name,
                address: branch.address,
                countryId: branch.countryId,
                status: branch.status,
                countryName: country?.country ?? null,
                countryFlagUrl: country?.flagUrl ?? null,
                supportsMercadoPago: country?.isoCountry === 'PE',
            };
        }), [branches, countryById]);

    const selectedBranch = useMemo(
        () => branchNodes.find((branch) => branch.publicId === selectedBranchPublicId) ?? null,
        [branchNodes, selectedBranchPublicId],
    );

    const selectedSupportsMercadoPago = selectedBranch?.supportsMercadoPago ?? false;

    // Mercado Pago solo existe en Perú: para el resto de sucursales no se pide estado.
    useEffect(() => {
        if (!enabled || !selectedBranchPublicId || !selectedSupportsMercadoPago) return;

        const load = async () => {
            await loadMercadoPagoStatus(selectedBranchPublicId);
        };

        void load();
    }, [enabled, selectedBranchPublicId, selectedSupportsMercadoPago, loadMercadoPagoStatus]);

    // Sin `?company=` no hay nada que pedir: se resuelve como recurso inexistente
    // sin tocar estado desde el efecto.
    const isMissingCompany = enabled && !companyPublicId;

    const retry = useCallback(() => setReloadToken((token) => token + 1), []);

    const retryTypes = useCallback(() => {
        if (selectedBranch?.countryId == null) return;
        void loadTypes(selectedBranch.countryId, true);
    }, [selectedBranch, loadTypes]);

    const reloadMercadoPago = useCallback(() => {
        if (selectedBranchPublicId && selectedSupportsMercadoPago) {
            void loadMercadoPagoStatus(selectedBranchPublicId);
        }
    }, [selectedBranchPublicId, selectedSupportsMercadoPago, loadMercadoPagoStatus]);

    return {
        manualAccounts, accountsStatus, accountsError, reloadManualAccounts,
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
