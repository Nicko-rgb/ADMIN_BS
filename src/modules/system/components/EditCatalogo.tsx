import type { ComponentType, FormEvent } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { InputField, ToggleField, SelectField, TextAreaField, FormRow, FormActions } from '../../../shared/components';
import type { RawOption } from '../../../shared/interfaces/forms.interface';
import '../styles/CatalogPage.css';
import { UploadCloud, X } from 'lucide-react';

// Un campo del formulario — el hook de cada catálogo arma este arreglo y maneja su propio estado.
// `row` agrupa campos en una misma FormRow (mismo número = misma fila); sin `row`, el campo ocupa su propia fila.
export interface CatalogFormField {
    name: string;
    label: string;
    type?: 'text' | 'boolean' | 'select' | 'textarea';
    value: string | number | boolean | null;
    onChange: (value: string | number | boolean) => void;
    required?: boolean;
    placeholder?: string;
    options?: RawOption[];
    row?: number;
    mayus?: boolean;
    numberOnly?: boolean;
}

interface EditCatalogoProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    title: string;
    icon?: ComponentType<{ size?: number; className?: string }>;
    fields: CatalogFormField[];
    isSaving?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

// Agrupa los campos que comparten `row` en una misma fila — sin `row`, el campo queda solo en la suya.
const groupFieldsByRow = (fields: CatalogFormField[]): CatalogFormField[][] => {
    const groups: CatalogFormField[][] = [];
    const rowIndex = new Map<number, CatalogFormField[]>();

    fields.forEach((field) => {
        if (field.row === undefined) {
            groups.push([field]);
            return;
        }
        const existing = rowIndex.get(field.row);
        if (existing) {
            existing.push(field);
        } else {
            const group = [field];
            rowIndex.set(field.row, group);
            groups.push(group);
        }
    });

    return groups;
};

// Renderiza un campo según su tipo — toggle, select, textarea o input de texto (default).
const renderField = (field: CatalogFormField) => {
    if (field.type === 'boolean') {
        return (
            <ToggleField
                key={field.name}
                name={field.name}
                label={field.label}
                checked={field.value as boolean}
                onChange={(e) => field.onChange(e.target.checked)}
            />
        );
    }

    if (field.type === 'select') {
        return (
            <SelectField
                key={field.name}
                name={field.name}
                label={field.label}
                value={(field.value as string) ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                options={field.options ?? []}
                required={field.required}
            />
        );
    }

    if (field.type === 'textarea') {
        return (
            <TextAreaField
                key={field.name}
                name={field.name}
                label={field.label}
                value={(field.value as string) ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
            />
        );
    }

    return (
        <InputField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(field.value as string) ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            mayus={field.mayus}
            numberOnly={field.numberOnly}
        />
    );
};

/** Modal de edición genérico para catálogos — solo renderiza label + input por campo, agrupados en filas; el hook de cada catálogo maneja estado y submit. */
export const EditCatalogo = ({ isOpen, onClose, onSubmit, title, icon, fields, isSaving = false, size = 'md' }: EditCatalogoProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={icon} size={size}>
        <form className="catalog_form" onSubmit={onSubmit}>
            {groupFieldsByRow(fields).map((group) => (
                <FormRow key={group.map((field) => field.name).join('-')}>
                    {group.map(renderField)}
                </FormRow>
            ))}
            <FormActions>
                <Button text="Cancelar" icon={X} size='lg' color="secondary" type="button" onClick={onClose} />
                <Button text="Guardar" icon={UploadCloud} size='lg' type="submit" loading={isSaving} />
            </FormActions>
        </form>
    </Modal>
);

export default EditCatalogo;
