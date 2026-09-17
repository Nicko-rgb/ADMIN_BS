import type { ChangeEvent, ComponentType, FocusEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

// Forma de una opción de SelectField — objeto {value,label} o un primitivo usado como value y label a la vez.
export interface Option {
    value: string | number;
    label: string;
}

export type RawOption = Option | string | number;

export type FieldIcon = ComponentType<{ size?: number; className?: string }>;

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'> {
    label?: string;
    name: string;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: FieldIcon;
    iconPosition?: 'left' | 'right';
    isPhone?: boolean;
    phoneCode?: string;
    mayus?: boolean;
    // `true` acepta decimales (montos); `'integer'` solo dígitos (documento, teléfono, código).
    numberOnly?: boolean | 'integer';
    // Permite un `-` inicial junto a `numberOnly` — coordenadas, saldos, ajustes.
    allowNegative?: boolean;
    textOnly?: boolean;
}

export interface SelectFieldProps {
    label?: string;
    name: string;
    value: string | number | undefined;
    onChange?: (e: { target: { name: string; value: string | number } }) => void;
    options?: RawOption[];
    error?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: FieldIcon;
    renderOption?: (option: RawOption) => ReactNode;
    showDefaultOption?: boolean;
    placeholder?: string;
    // Búsqueda remota — ver useSelectField. Si se pasa, `options` se ignora: el dropdown busca
    // contra el backend en vez de filtrar un array ya cargado en memoria.
    onSearch?: (query: string) => Promise<RawOption[]>;
    minSearchLength?: number;
    searchDebounceMs?: number;
    emptyOption?: RawOption;
}

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'onBlur'> {
    label?: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
    error?: string;
    icon?: FieldIcon;
}

export interface CheckboxFieldProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

export interface ToggleFieldProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
}

export interface FormSectionProps {
    title?: string;
    children: ReactNode;
    className?: string;
    icon?: FieldIcon;
}

export interface FormRowProps {
    children: ReactNode;
    className?: string;
}

export interface FormActionsProps {
    children: ReactNode;
    className?: string;
}
