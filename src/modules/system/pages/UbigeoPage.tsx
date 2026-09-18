import { ChevronRight, Folder, FolderOpen, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { Header } from '../../../shared/components/Header';
import { Dialog } from '../../../shared/components/Dialog';
import { useUbigeo } from '../hooks/useUbigeo';
import { CreateEditUbigeo } from '../components/CreateEditUbigeo';
import type { Country, UbigeoNode } from '../../../shared/interfaces/catalog.interface';
import '../styles/UbigeoPage.css';

type TreeAccent = 'country' | 'level1' | 'level2' | 'level3';

interface TreeListProps<T extends { id: number }> {
    items: T[];
    isLoading?: boolean;
    expandedId: number | null;
    accent: TreeAccent;
    getLabel: (item: T) => string;
    getCode: (item: T) => string;
    onToggleExpand?: (item: T) => void;
    onAdd?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    emptyMessage: string;
}

/**
 * Lista de "carpetas" de un nivel del árbol — país, nivel 1, 2 o 3 reutilizan este mismo bloque.
 * Con un `expandedId` activo, filtra a solo esa fila: los hermanos desaparecen mientras la rama
 * está abierta, en vez de quedar colapsados pero visibles.
 */
const TreeList = <T extends { id: number }>({
    items, isLoading = false, expandedId, accent, getLabel, getCode,
    onToggleExpand, onAdd, onEdit, onDelete, emptyMessage,
}: TreeListProps<T>) => {
    const visibleItems = expandedId !== null ? items.filter((item) => item.id === expandedId) : items;

    if (isLoading) {
        return (
            <div className="ubigeo_tree_state">
                <span className="ubigeo_tree_spinner" aria-hidden="true" />
                Cargando...
            </div>
        );
    }

    if (visibleItems.length === 0) {
        return <div className="ubigeo_tree_state">{emptyMessage}</div>;
    }

    return (
        <ul className={`ubigeo_tree_list accent_${accent}`}>
            {visibleItems.map((item) => {
                const isExpanded = item.id === expandedId;
                return (
                    <li key={item.id} className={`ubigeo_tree_row ${isExpanded ? 'expanded' : ''}`}>
                        <button
                            type="button"
                            className="ubigeo_tree_row_main"
                            onClick={() => onToggleExpand?.(item)}
                            disabled={!onToggleExpand}
                        >
                            {onToggleExpand && <ChevronRight size={16} className="ubigeo_tree_chevron" />}
                            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                            <span className="ubigeo_tree_name">{getLabel(item)}</span>
                            <span className="ubigeo_tree_code">{getCode(item)}</span>
                        </button>

                        <div className="ubigeo_tree_actions">
                            {onAdd && (
                                <button type="button" className="add" onClick={() => onAdd(item)} aria-label="Añadir">
                                    <Plus size={14} />
                                </button>
                            )}
                            {onEdit && (
                                <button type="button" className="edit" onClick={() => onEdit(item)} aria-label="Editar">
                                    <Pencil size={14} />
                                </button>
                            )}
                            {onDelete && (
                                <button type="button" className="delete" onClick={() => onDelete(item)} aria-label="Eliminar">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

// Árbol de ubigeo — países como raíz, niveles 1/2/3 en cascada. Crear/editar/eliminar funciona
// en cualquier nodo, sin importar el nivel (a diferencia de la vieja tabla, que solo exponía hojas).
const UbigeoPage = () => {
    const {
        countries,
        expandedCountry, expandedLevel1, expandedLevel2,
        level1Items, level2Items, level3Items,
        isLoadingLevel1, isLoadingLevel2, isLoadingLevel3,
        toggleCountry, toggleLevel1, toggleLevel2,
        collapseToCountries, collapseToLevel1List, collapseToLevel2List,
        openCreateLevel1, openCreateChild, openEdit, closeModal,
        modalContext, isModalOpen, form, setField, handleSubmit, isSaving,
        deletingNode, isDeleteOpen, openDelete, closeDelete, confirmDelete, isDeleting,
    } = useUbigeo();

    const modalTitle = !modalContext
        ? ''
        : modalContext.mode === 'edit'
            ? 'Editar ubigeo'
            : `Nuevo nivel ${modalContext.level}`;

    return (
        <div className="catalog_page ubigeo_page">
            <Header title="Ubigeo" subtitle="Administra la información geográfica del sistema" icon={MapPin} />

            <nav className="ubigeo_breadcrumb" aria-label="breadcrumb">
                <button type="button" onClick={collapseToCountries} className={!expandedCountry ? 'active' : ''}>Países</button>
                {expandedCountry && (
                    <>
                        <ChevronRight size={14} />
                        <button type="button" onClick={collapseToLevel1List} className={!expandedLevel1 ? 'active' : ''}>{expandedCountry.country}</button>
                    </>
                )}
                {expandedLevel1 && (
                    <>
                        <ChevronRight size={14} />
                        <button type="button" onClick={collapseToLevel2List} className={!expandedLevel2 ? 'active' : ''}>{expandedLevel1.name}</button>
                    </>
                )}
                {expandedLevel2 && (
                    <>
                        <ChevronRight size={14} />
                        <span className="active">{expandedLevel2.name}</span>
                    </>
                )}
            </nav>

            <div className="ubigeo_tree card">
                <TreeList<Country>
                    items={countries}
                    expandedId={expandedCountry?.id ?? null}
                    accent="country"
                    getLabel={(country) => country.country}
                    getCode={(country) => country.isoCountry}
                    onToggleExpand={toggleCountry}
                    onAdd={openCreateLevel1}
                    emptyMessage="No hay países activos"
                />

                {expandedCountry && (
                    <div className="ubigeo_tree_nested">
                        <TreeList<UbigeoNode>
                            items={level1Items}
                            isLoading={isLoadingLevel1}
                            expandedId={expandedLevel1?.id ?? null}
                            accent="level1"
                            getLabel={(node) => node.name}
                            getCode={(node) => node.code}
                            onToggleExpand={toggleLevel1}
                            onAdd={openCreateChild}
                            onEdit={openEdit}
                            onDelete={openDelete}
                            emptyMessage="Sin nivel 1 registrado"
                        />

                        {expandedLevel1 && (
                            <div className="ubigeo_tree_nested">
                                <TreeList<UbigeoNode>
                                    items={level2Items}
                                    isLoading={isLoadingLevel2}
                                    expandedId={expandedLevel2?.id ?? null}
                                    accent="level2"
                                    getLabel={(node) => node.name}
                                    getCode={(node) => node.code}
                                    onToggleExpand={toggleLevel2}
                                    onAdd={openCreateChild}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                    emptyMessage="Sin nivel 2 registrado"
                                />

                                {expandedLevel2 && (
                                    <div className="ubigeo_tree_nested">
                                        <TreeList<UbigeoNode>
                                            items={level3Items}
                                            isLoading={isLoadingLevel3}
                                            expandedId={null}
                                            accent="level3"
                                            getLabel={(node) => node.name}
                                            getCode={(node) => node.code}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                            emptyMessage="Sin nivel 3 registrado"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateEditUbigeo
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                mode={modalContext?.mode ?? 'create'}
                title={modalTitle}
                contextLabel={modalContext?.parentLabel ? `Dentro de: ${modalContext.parentLabel}` : null}
                form={form}
                setField={setField}
                isSaving={isSaving}
            />

            <Dialog
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                title="Eliminar ubigeo"
                description={`¿Seguro que deseas eliminar "${deletingNode?.name}"? Esta acción no se puede deshacer.`}
                variant="alert"
                primaryAction={{ label: isDeleting ? 'Eliminando...' : 'Eliminar', onClick: confirmDelete }}
                secondaryAction={{ label: 'Cancelar', onClick: closeDelete }}
            />
        </div>
    );
};

export default UbigeoPage;
