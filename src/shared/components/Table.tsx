import type { ComponentType, ReactNode } from 'react';
import { Button } from './Button';
import type { PaginationMeta } from '../interfaces/pagination.interface';
import '../styles/Table.css';

// Una columna define su encabezado y cómo renderizar su celda — texto plano
// por defecto (row[key]), o cualquier cosa vía `render` (imagen, badge, acciones, etc.).
export interface TableColumn<T> {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
}

interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    keyExtractor: (row: T) => string | number;
    isLoading?: boolean;
    emptyMessage?: string;
    // Paginación — solo las tablas la tienen, integrada acá. Objeto tal como lo arma el backend
    // (toPaginationMeta). Si se omite pagination/onPageChange, no se renderiza el pie de paginación.
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
}

// Tabla genérica reutilizable — no sabe nada de ninguna entidad puntual, todo llega por columns/data.
// Siempre agrega una primera columna "#" con la numeración de fila (1..N de la página actual).
export const Table = <T,>({
    columns,
    data,
    keyExtractor,
    isLoading = false,
    emptyMessage = 'Sin resultados',
    pagination,
    onPageChange,
}: TableProps<T>) => {
    const colSpan = columns.length + 1;
    const showPagination = pagination !== undefined && onPageChange && pagination.totalPages > 1;

    return (
        <div className="table_wrapper">
            <table>
                <thead>
                    <tr>
                        <th className="table_number_col">#</th>
                        {columns.map((column) => (
                            <th key={column.key}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td className="table_state" colSpan={colSpan}>
                                <span className="table_spinner" aria-hidden="true" />
                                Cargando...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td className="table_state" colSpan={colSpan}>{emptyMessage}</td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr key={keyExtractor(row)}>
                                <td className="table_number_col">{index + 1}</td>
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {showPagination && (
                <div className="pagination">
                    <Button text="Anterior" size="sm" color="secondary" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} />
                    <span className="pagination_label">
                        Página {pagination.page} de {pagination.totalPages} · {pagination.total} resultados
                    </span>
                    <Button text="Siguiente" size="sm" color="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)} />
                </div>
            )}
        </div>
    );
};

interface TableImageProps {
    src: string | null;
    alt: string;
}

// Celda de imagen para Table — círculo con fallback cuando no hay src.
export const TableImage = ({ src, alt }: TableImageProps) => (
    src ? <img src={src} alt={alt} className="table_image" /> : <span className="table_image table_image_empty" aria-hidden="true" />
);

export type TableActionVariant = 'primary' | 'edit' | 'delete' | 'view';

// Una acción de fila: quién la dispara (onClick, ya cerrado sobre la fila desde el `render` del
// caller), con qué ícono, si además de ícono lleva texto, y su variante visual (color del ícono
// nada más — ver Table.css: el fondo de hover es siempre neutro, no un tinte de color, así no se
// pone brilloso en modo oscuro).
export interface TableAction {
    label: string;
    icon: ComponentType<{ size?: number }>;
    onClick: () => void;
    variant?: TableActionVariant;
    showLabel?: boolean;
    disabled?: boolean;
}

interface TableActionsProps {
    actions: TableAction[];
}

// Columna de acciones para Table — botones dinámicos, uno por acción que pase el caller.
export const TableActions = ({ actions }: TableActionsProps) => (
    <div className="table_actions">
        {actions.map(({ label, icon: Icon, onClick, variant = 'view', showLabel = false, disabled = false }) => (
            <button
                key={label}
                type="button"
                className={`table_action_btn table_action_${variant}`}
                onClick={onClick}
                disabled={disabled}
                title={label}
            >
                <Icon size={16} />
                {showLabel && <span>{label}</span>}
            </button>
        ))}
    </div>
);

export default Table;
