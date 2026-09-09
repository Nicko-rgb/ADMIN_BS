import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { normalizeStr } from '../utils/formatText';
import type { RawOption } from '../interfaces/forms.interface';

interface UseSelectFieldParams {
    name: string;
    value: string | number | undefined;
    options?: RawOption[];
    showDefaultOption?: boolean;
    onChange?: (e: { target: { name: string; value: string | number } }) => void;
    // Búsqueda remota — si se pasa, el dropdown deja de filtrar `options` en memoria y busca
    // contra el backend a medida que se escribe (con debounce y un mínimo de caracteres).
    onSearch?: (query: string) => Promise<RawOption[]>;
    minSearchLength?: number;
    searchDebounceMs?: number;
    // Opción fija siempre visible arriba de la lista (ej. "Ninguno") — útil en selects nullable.
    emptyOption?: RawOption;
}

interface MenuPosition {
    top: number;
    left: number;
    width: number;
}

const optionValue = (opt: RawOption): string | number => (typeof opt === 'object' ? opt.value : opt);
const optionLabel = (opt: RawOption): string => (typeof opt === 'object' ? opt.label : String(opt));

/**
 * Estado y lógica del dropdown personalizado de SelectField: opciones filtradas en memoria, o
 * buscadas en el backend vía `onSearch` (con debounce y mínimo de caracteres), apertura/cierre y
 * cierre automático al clickear afuera. SelectField.tsx solo consume lo que este hook devuelve.
 *
 * El menú se renderiza en un portal a `document.body` (ver SelectField.tsx) — nunca como hijo
 * directo del trigger — así ningún `overflow: hidden`/`auto` de un ancestro (una card con
 * animación, un modal, una tabla con scroll) lo recorta. Por eso acá se calcula `menuPosition`
 * a mano con `getBoundingClientRect()` en vez de depender de `position: absolute` + flujo normal,
 * y se recalcula en cada scroll/resize mientras está abierto — un portal ya no se mueve solo
 * con el layout de su trigger.
 */
export const useSelectField = ({
    name,
    value,
    options = [],
    showDefaultOption = false,
    onChange,
    onSearch,
    minSearchLength = 1,
    searchDebounceMs = 500,
    emptyOption,
}: UseSelectFieldParams) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [remoteResults, setRemoteResults] = useState<RawOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [remoteSelectedLabel, setRemoteSelectedLabel] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const finalOptions = useMemo<RawOption[]>(() => {
        if (!showDefaultOption) return options;
        return [{ value: '', label: 'TODOS' }, ...options];
    }, [options, showDefaultOption]);

    const selectedOption = useMemo(() =>
        finalOptions.find(opt => String(optionValue(opt)).trim() === String(value ?? '').trim()),
    [finalOptions, value]);

    // Modo remoto: resuelve la etiqueta del valor ya seleccionado buscándolo por su propio valor
    // — el form solo trae el value (ej. al editar un registro existente), nunca el label.
    useEffect(() => {
        if (!onSearch) return;
        if (!value) {
            setRemoteSelectedLabel(null);
            return;
        }

        let active = true;
        onSearch(String(value))
            .then((opts) => {
                if (!active) return;
                const match = opts.find(opt => String(optionValue(opt)) === String(value));
                setRemoteSelectedLabel(match ? optionLabel(match) : String(value));
            })
            .catch(() => { if (active) setRemoteSelectedLabel(String(value)); });

        return () => { active = false; };
    }, [onSearch, value]);

    // Modo remoto: debounce + mínimo de caracteres antes de disparar la búsqueda al backend.
    useEffect(() => {
        if (!onSearch) return;
        const trimmed = searchTerm.trim();
        if (trimmed.length < minSearchLength) {
            setRemoteResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            setIsSearching(true);
            onSearch(trimmed)
                .then(setRemoteResults)
                .catch(() => setRemoteResults([]))
                .finally(() => setIsSearching(false));
        }, searchDebounceMs);

        return () => clearTimeout(timeout);
    }, [onSearch, searchTerm, minSearchLength, searchDebounceMs]);

    const localFilteredOptions = useMemo(() => {
        if (!searchTerm) return finalOptions;
        return finalOptions.filter(opt => normalizeStr(optionLabel(opt)).includes(normalizeStr(searchTerm)));
    }, [finalOptions, searchTerm]);

    const filteredOptions = useMemo(() => {
        const base = onSearch ? remoteResults : localFilteredOptions;
        return emptyOption ? [emptyOption, ...base] : base;
    }, [onSearch, remoteResults, localFilteredOptions, emptyOption]);

    const trimmedSearchLength = searchTerm.trim().length;
    const searchHint = onSearch && trimmedSearchLength > 0 && trimmedSearchLength < minSearchLength
        ? `Escribe al menos ${minSearchLength} caracteres`
        : null;

    const updateMenuPosition = useCallback(() => {
        const rect = dropdownRef.current?.getBoundingClientRect();
        if (!rect) return;
        setMenuPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }, []);

    // Mientras está abierto, la posición se recalcula en cada scroll (de la página o de
    // cualquier contenedor con scroll propio, por eso `true` — fase de captura) y resize.
    useEffect(() => {
        if (!isOpen) return;

        updateMenuPosition();
        window.addEventListener('scroll', updateMenuPosition, true);
        window.addEventListener('resize', updateMenuPosition);

        return () => {
            window.removeEventListener('scroll', updateMenuPosition, true);
            window.removeEventListener('resize', updateMenuPosition);
        };
    }, [isOpen, updateMenuPosition]);

    // Cierra el dropdown al clickear fuera — del trigger o del menú. El menú vive en un portal
    // (hijo de document.body, no de dropdownRef), por eso hay que chequear los dos refs.
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (dropdownRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setIsOpen(false);
            setSearchTerm('');
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: RawOption) => {
        onChange?.({ target: { name, value: optionValue(option) } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const open = (disabled?: boolean) => { if (!disabled) setIsOpen(true); };
    const toggle = (disabled?: boolean) => { if (!disabled) setIsOpen(o => !o); };

    const displayValue = isOpen
        ? searchTerm
        : onSearch
            ? (remoteSelectedLabel ?? '')
            : (selectedOption ? optionLabel(selectedOption) : '');

    return {
        isOpen,
        dropdownRef,
        menuRef,
        menuPosition,
        filteredOptions,
        displayValue,
        isSearching,
        searchHint,
        handleSelect,
        handleInputChange,
        open,
        toggle,
        optionValue,
        optionLabel,
    };
};
