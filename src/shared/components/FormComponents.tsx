import type { ChangeEvent, FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { LuChevronDown } from 'react-icons/lu';
import { useSelectField } from '../hooks/useSelectField';
import type {
    InputFieldProps,
    SelectFieldProps,
    TextAreaFieldProps,
    CheckboxFieldProps,
    ToggleFieldProps,
    FormSectionProps,
    FormRowProps,
    FormActionsProps,
} from '../interfaces/forms.interface';
import '../styles/FormComponents.css';

/**
 * Deja solo dígitos, con un `-` inicial si `allowNegative`. Con `allowDecimal` conserva además
 * el primer punto y descarta los siguientes; sin él, ni siquiera el punto pasa.
 */
const sanitizeNumber = (value: string, allowDecimal: boolean, allowNegative: boolean): string => {
    const sign = allowNegative && value.startsWith('-') ? '-' : '';
    const digitsAndDots = value.replace(/[^0-9.]/g, '');
    if (!allowDecimal) return sign + digitsAndDots.replace(/\./g, '');

    const firstDotIndex = digitsAndDots.indexOf('.');
    if (firstDotIndex === -1) return sign + digitsAndDots;
    return sign + digitsAndDots.slice(0, firstDotIndex + 1) + digitsAndDots.slice(firstDotIndex + 1).replace(/\./g, '');
};

// Deja solo letras (con tildes y ñ), espacios, apóstrofo y guion — descarta dígitos y símbolos.
const sanitizeTextOnly = (value: string): string => value.replace(/[^\p{L}\s'-]/gu, '');

/**
 * Campo de texto con label estático encima. Soporta ícono opcional
 * (izquierda/derecha) y, con `isPhone`, un prefijo de código de país
 * (`phoneCode`) — `value` sigue siendo solo el número local puro.
 */
export const InputField = ({
    label = '',
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    placeholder = '',
    required = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'right',
    isPhone = false,
    phoneCode,
    mayus = false,
    numberOnly = false,
    allowNegative = false,
    textOnly = false,
    ...rest
}: InputFieldProps) => {
    /**
     * Normaliza lo tecleado antes de emitirlo: `mayus` pasa a mayúsculas, `textOnly` descarta
     * dígitos y símbolos, `numberOnly` descarta todo lo que no sea dígito (más el punto decimal
     * salvo que sea `'integer'`, y el signo si `allowNegative`).
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (mayus) e.target.value = e.target.value.toUpperCase();
        if (textOnly) e.target.value = sanitizeTextOnly(e.target.value);
        if (numberOnly) e.target.value = sanitizeNumber(e.target.value, numberOnly !== 'integer', allowNegative);
        onChange(e);
    };

    // Al perder foco, recorta espacios al inicio/final — evita que lleguen al backend valores como "PEN " que rompen validaciones de longitud exacta.
    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const trimmed = e.target.value.trim();
        if (trimmed !== e.target.value) {
            e.target.value = trimmed;
            onChange(e as unknown as ChangeEvent<HTMLInputElement>);
        }
        onBlur?.(e);
    };

    return (
        <div className={`input_group ${Icon ? `has_icon icon_${iconPosition}` : ''} ${isPhone ? 'is_phone' : ''}`}>
            {label && (
                <label htmlFor={name} className="label">
                    {label}{required && <span className="required">*</span>}
                </label>
            )}
            <div className="input_container">
                {isPhone && (
                    <span className={`phone_code_prefix ${phoneCode ? 'has_code' : ''}`}>
                        {phoneCode || '-'}
                    </span>
                )}
                {Icon && <Icon className="input_icon" size={15} />}
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`form_input ${error ? 'error' : ''}`}
                    required={required}
                    disabled={disabled}
                    inputMode={numberOnly ? (numberOnly === 'integer' ? 'numeric' : 'decimal') : undefined}
                    {...rest}
                />
            </div>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

/**
 * Select con label estático encima. Dropdown propio (sin `<select>` nativo).
 * Sin `onSearch`, filtra `options` en memoria al escribir. Con `onSearch`, busca contra el
 * backend (debounce + mínimo de caracteres) en vez de esperar un array ya cargado — para
 * catálogos que no conviene traer completos al front. Todo el estado/lógica vive en
 * useSelectField — este componente solo presenta.
 */
export const SelectField = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    disabled = false,
    icon: Icon,
    renderOption,
    showDefaultOption = false,
    placeholder,
    onSearch,
    minSearchLength,
    searchDebounceMs,
    emptyOption,
}: SelectFieldProps) => {
    const {
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
    } = useSelectField({ name, value, options, showDefaultOption, onChange, onSearch, minSearchLength, searchDebounceMs, emptyOption });

    return (
        <div
            className={`input_group custom_select_group ${Icon ? 'has_icon' : ''} ${isOpen ? 'is_open' : ''}`}
            ref={dropdownRef}
        >
            {label && (
                <label className="label" htmlFor={name}>
                    {label}{required && <span className="required">*</span>}
                </label>
            )}

            <div className="input_container">
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={() => open(disabled)}
                    disabled={disabled}
                    autoComplete="off"
                    placeholder={placeholder}
                    className={`form_input custom_select_trigger ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
                />

                <LuChevronDown
                    className={`dropdown_arrow ${isOpen ? 'rotate' : ''}`}
                    onClick={() => toggle(disabled)}
                />
            </div>

            {isOpen && menuPosition && createPortal(
                <div
                    ref={menuRef}
                    className="custom_dropdown_menu"
                    style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
                >
                    {searchHint ? (
                        <div className="custom_dropdown_no_options">{searchHint}</div>
                    ) : isSearching ? (
                        <div className="custom_dropdown_no_options">Buscando...</div>
                    ) : filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const isSelected = String(optionValue(option)) === String(value);
                            return (
                                <div
                                    key={index}
                                    className={`custom_dropdown_item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {renderOption ? renderOption(option) : optionLabel(option)}
                                </div>
                            );
                        })
                    ) : (
                        <div className="custom_dropdown_no_options">No se encontraron resultados</div>
                    )}
                </div>,
                document.body
            )}

            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// Campo de texto multilínea con label estático encima.
export const TextAreaField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder = '',
    required = false,
    disabled = false,
    rows = 4,
    icon: Icon,
    ...rest
}: TextAreaFieldProps) => {
    // Al perder foco, recorta espacios al inicio/final — mismo criterio que InputField.
    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
        const trimmed = e.target.value.trim();
        if (trimmed !== e.target.value) {
            e.target.value = trimmed;
            onChange(e as unknown as ChangeEvent<HTMLTextAreaElement>);
        }
        onBlur?.(e);
    };

    return (
        <div className={`input_group ${Icon ? 'has_icon' : ''}`}>
            {label && (
                <label htmlFor={name} className="label">
                    {label}{required && <span className="required">*</span>}
                </label>
            )}
            <div className="input_container">
                {Icon && <Icon className="input_icon" size={20} />}
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`form_textarea ${error ? 'error' : ''}`}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                    {...rest}
                />
            </div>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// Checkbox con label al costado.
export const CheckboxField = ({
    label,
    name,
    checked,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
}: CheckboxFieldProps) => {
    return (
        <div className="input_group">
            <label className="checkbox_container">
                <input
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className="checkbox-input"
                />
                <span className="checkbox_text">
                    {label}{required && <span className="required">*</span>}
                </span>
            </label>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// Interruptor encendido/apagado — mismo contrato de props que CheckboxField, para usarse como reemplazo directo.
export const ToggleField = ({
    label,
    name,
    checked,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
}: ToggleFieldProps) => {
    return (
        <div className="input_group">
            <label className="toggle_container">
                <input
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className="toggle_input"
                />
                <span className="toggle_track">
                    <span className="toggle_thumb" />
                </span>
                <span className="toggle_text">
                    {label}{required && <span className="required">*</span>}
                </span>
            </label>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// Agrupa un bloque de campos bajo un título con ícono opcional.
export const FormSection = ({ title, children, className = '', icon: Icon }: FormSectionProps) => (
    <div className={`form_section ${className}`}>
        <div className="form_section_title">
            {Icon && <Icon size={20} />}{title && <h3>{title}</h3>}
        </div>
        <div className="form_section_content">{children}</div>
    </div>
);

// Organiza varios campos en una misma fila.
export const FormRow = ({ children, className = '' }: FormRowProps) => (
    <div className={`form_row ${className}`}>{children}</div>
);

// Agrupa los botones de acción al final de un formulario.
export const FormActions = ({ children, className = '' }: FormActionsProps) => (
    <div className={`form_actions ${className}`}>{children}</div>
);
