import { useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Clock, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Modal, Button, InputField, FormActions, ToggleField, EmptyScreen } from '../../../shared/components';
import { handleApiError } from '../../../shared/utils/errorHandler';
import toast from '../../../shared/utils/toast';
import BusinessHourService from '../service/bussinesHourService';
import type { BussinesHourProps, BusinessHourData, HourDay, HourFormValues } from '../interfaces/bussinesHour.interfece';
import '../styles/BussinesHour.css';

/** Los 7 días en el orden en que se muestran (lunes → domingo). */
const DAYS: { value: HourDay; label: string }[] = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' },
];

/** Formato de hora del backend: apertura 00:00–23:59 y cierre hasta 24:00. */
const START_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const END_PATTERN = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;
/** Fin del día — el backend también acepta '00:00' y lo normaliza a esto. */
const END_OF_DAY = '24:00';

/**
 * Un bloque en edición. `price` es string porque es lo que escribe el input: se
 * convierte a número recién al armar el payload. `key` identifica la fila en el
 * borrador y desaparece al guardar (el backend devuelve los hour_id nuevos).
 */
interface HourDraft {
    key: string;
    day: HourDay;
    startTime: string;
    endTime: string;
    price: string;
    isClosed: boolean;
}

// Contador de filas del borrador — solo necesita ser único dentro del modal.
let draftSeed = 0;
const newDraftKey = () => `draft-${(draftSeed += 1)}`;

/**
 * Completa lo escrito a 'HH:mm' al salir del campo: '8' → '08:00', '08:3' →
 * '08:30' (el dígito suelto es la decena de los minutos) y '24' → '24:00'.
 */
const normalizeTime = (raw: string): string => {
    const value = raw.trim();
    if (!value) return '';
    if (value === END_OF_DAY) return END_OF_DAY;

    // '8:00' / '8:5' / '08:' → 'HH:mm'
    const parts = /^(\d{1,2}):(\d{0,2})$/.exec(value);
    if (parts) return `${parts[1].padStart(2, '0')}:${parts[2].padEnd(2, '0')}`;

    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) return `${digits.padStart(2, '0')}:00`;
    if (digits.length === 3) return `${digits[0].padStart(2, '0')}:${digits.slice(1)}0`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

/** BusinessHourData (API) → borrador editable. */
const toDrafts = (hours: BusinessHourData[]): HourDraft[] =>
    hours.map((hour) => {
        const endTime = hour.endTime.slice(0, 5);
        return {
            key: newDraftKey(),
            day: hour.dayOfWeek,
            startTime: hour.startTime.slice(0, 5),
            endTime: endTime === '00:00' ? END_OF_DAY : endTime,
            price: hour.price,
            isClosed: hour.isClosed,
        };
    });

/** 'HH:mm' | '24:00' → minutos del día (24:00 = 1440). */
const toMinutes = (time: string): number => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
};

/** Suma una hora a una apertura, sin pasarse de '24:00'. */
const addHour = (time: string): string => {
    const total = Math.min(toMinutes(time) + 60, 24 * 60);
    const hour = String(Math.floor(total / 60)).padStart(2, '0');
    const minute = String(total % 60).padStart(2, '0');
    return `${hour}:${minute}`;
};

/** Normaliza las horas escritas a mano y unifica el cierre de medianoche. */
const normalizeDraftTimes = (hours: HourDraft[]): HourDraft[] =>
    hours.map((block) => {
        const endTime = normalizeTime(block.endTime);
        return {
            ...block,
            startTime: normalizeTime(block.startTime),
            endTime: endTime === '00:00' ? END_OF_DAY : endTime,
        };
    });

/**
 * Máscara de hora mientras se escribe ('HH:mm').
 */
const maskTime = (raw: string, previous: string, maxHour: number): string => {
    // Un solo carácter borrado (backspace): el ':' se puede descartar para que
    // el borrado siga bajando dígito por dígito en vez de quedar trabado.
    const deleting = raw.length === previous.length - 1;
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (!digits) return '';

    // '8' → '08': la hora nunca empieza con 3-9, así que el primer dígito se
    // completa y los siguientes caen en los minutos (en vez de formar '83').
    const normalized = digits[0] > '2' ? `0${digits}`.slice(0, 4) : digits;

    const hourDigits = normalized.slice(0, 2);
    const hour = Number(hourDigits);
    if (hour > maxHour) return previous;

    const minutes = normalized.slice(2, 4);
    if (minutes.length === 1 && hour === 24 && minutes !== '0') return previous;
    if (minutes.length === 2 && (Number(minutes) > 59 || (hour === 24 && minutes !== '00'))) return previous;

    if (minutes.length > 0) return `${hourDigits}:${minutes}`;

    // Un solo dígito: todavía no hay hora completa, no se agrega el ':'.
    if (normalized.length < 2) return normalized;

    // Dos dígitos = hora completa: se muestra ya el ':' de los minutos. Al
    // borrar sin separador se deja 'HH' para que el backspace siga bajando.
    const showColon = raw.includes(':') || !deleting;
    return showColon ? `${hourDigits}:` : hourDigits;
};

interface TimeFieldProps {
    name: string;
    value: string;
    error?: string;
    ariaLabel: string;
    /** Hora máxima escribible: 23 en apertura, 24 en cierre. */
    maxHour: number;
    onChange: (value: string) => void;
    onCommit: (value: string) => void;
}

/**
 * Hora escrita a mano en vez de `<input type="time">`: el input nativo solo
 * llega a 23:59 y no puede mostrar 24:00, que es justo el valor que se necesita
 * para cerrar el día. La máscara se aplica al escribir y al salir del campo se
 * completa a 'HH:mm'.
 */
const TimeField = ({ name, value, error, ariaLabel, maxHour, onChange, onCommit }: TimeFieldProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    // Posición del cursor al escribir — se restaura después de enmascarar para
    // que el ':' automático no lo mande al final cuando se edita en el medio.
    const caret = useRef<{ digits: number; toEnd: boolean } | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value: raw, selectionStart } = e.target;
        const cursor = selectionStart ?? raw.length;
        caret.current = {
            digits: raw.slice(0, cursor).replace(/\D/g, '').length,
            toEnd: cursor >= raw.length,
        };
        onChange(maskTime(raw, value, maxHour));
    };

    useLayoutEffect(() => {
        if (!caret.current) return;
        const { digits, toEnd } = caret.current;
        caret.current = null;

        const input = inputRef.current;
        if (!input) return;

        if (toEnd) {
            const end = input.value.length;
            input.setSelectionRange(end, end);
            return;
        }

        let position = 0;
        let seen = 0;
        while (position < input.value.length && seen < digits) {
            if (/\d/.test(input.value[position])) seen += 1;
            position += 1;
        }
        input.setSelectionRange(position, position);
    }, [value]);

    return (
        <div className="input_group">
            <div className="input_container">
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    id={name}
                    name={name}
                    value={value}
                    placeholder="HH:mm"
                    maxLength={5}
                    aria-label={ariaLabel}
                    className={`form_input bh_time ${error ? 'error' : ''}`}
                    onChange={handleChange}
                    onBlur={() => onCommit(normalizeTime(value))}
                />
            </div>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

/**
 * Modal de horarios y precios del espacio: los 7 días a la izquierda y el día
 * elegido a la derecha. Cada bloque tiene su propio toggle (abierto/cerrado) y
 * la cabecera del día tiene el toggle del día completo (abre o cierra todos sus
 * bloques a la vez).
 *
 * El guardado reemplaza la semana entera con un solo PUT: el borrador local es
 * el estado final del horario (un día sin bloques simplemente no aparece en el
 * payload) e `is_closed` viaja por bloque, así que los toggles se persisten con
 * el mismo guardado.
 */
export const BussinesHour = ({ isOpen, onClose, spacePublicId, businessHours, onSaved }: BussinesHourProps) => {
    const [blocks, setBlocks] = useState<HourDraft[]>([]);
    const [selectedDay, setSelectedDay] = useState<HourDay>('MONDAY');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    /* La data llega por props: al abrir se copia a un borrador local, así cerrar
       sin guardar no toca nada. Solo se re-siembra al abrir (no cuando la página
       recarga la lista) para no pisar lo que el usuario está editando. Layout
       effect: el modal pinta con la data ya sembrada, sin un frame en blanco. */
    useLayoutEffect(() => {
        if (!isOpen) return;
        const drafts = toDrafts(businessHours);
        setBlocks(drafts);
        setSelectedDay(drafts[0]?.day ?? 'MONDAY');
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const dayBlocks = blocks
        .filter((block) => block.day === selectedDay)
        .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const dayClosed = dayBlocks.length > 0 && dayBlocks.every((block) => block.isClosed);

    /** Resumen del día para la lista de la izquierda. */
    const daySummary = (day: HourDay): string => {
        const list = blocks.filter((block) => block.day === day);
        if (list.length === 0) return 'Sin horarios';
        if (list.every((block) => block.isClosed)) return 'Cerrado';
        const sorted = [...list].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
        return `${sorted[0].startTime} – ${sorted[sorted.length - 1].endTime}`;
    };

    const updateBlock = (key: string, patch: Partial<HourDraft>) => {
        setBlocks((prev) => prev.map((block) => (block.key === key ? { ...block, ...patch } : block)));
        // Al editar una fila se descartan sus errores anteriores.
        setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([field]) => !field.startsWith(`${key}-`))));
    };

    const addBlock = () => {
        const last = dayBlocks[dayBlocks.length - 1];
        // El bloque nuevo arranca donde termina el anterior (o a las 08:00 si ese
        // ya cerró el día a las 24:00) y hereda su precio como sugerencia.
        const startTime = last && last.endTime !== END_OF_DAY ? last.endTime : '08:00';
        const block: HourDraft = {
            key: newDraftKey(),
            day: selectedDay,
            startTime,
            endTime: addHour(startTime),
            price: last?.price ?? '',
            isClosed: false,
        };
        setBlocks((prev) => [...prev, block]);
    };

    const removeBlock = (key: string) => {
        setBlocks((prev) => prev.filter((block) => block.key !== key));
    };

    /** El toggle del día abre/cierra TODOS sus bloques a la vez. */
    const toggleDay = (open: boolean) => {
        setBlocks((prev) => prev.map((block) => (block.day === selectedDay ? { ...block, isClosed: !open } : block)));
    };

    /** Espeja las validaciones del backend, pero señalando la fila que falla. */
    const validate = (list: HourDraft[]): boolean => {
        const next: Record<string, string> = {};
        const blocksByDay = new Map<HourDay, HourDraft[]>();

        for (const block of list) {
            if (!block.startTime) next[`${block.key}-start`] = 'Requerido';
            else if (!START_PATTERN.test(block.startTime)) next[`${block.key}-start`] = 'Formato HH:mm (00:00 a 23:59)';

            if (!block.endTime) next[`${block.key}-end`] = 'Requerido';
            else if (!END_PATTERN.test(block.endTime)) next[`${block.key}-end`] = 'Formato HH:mm o 24:00';

            const price = Number(block.price);
            if (!block.price || !Number.isFinite(price) || price <= 0) {
                next[`${block.key}-price`] = 'Precio mayor a 0';
            }

            if (
                START_PATTERN.test(block.startTime)
                && END_PATTERN.test(block.endTime)
                && toMinutes(block.endTime) <= toMinutes(block.startTime)
            ) {
                next[`${block.key}-end`] = 'Debe ser mayor al inicio';
            }

            const dayList = blocksByDay.get(block.day) ?? [];
            dayList.push(block);
            blocksByDay.set(block.day, dayList);
        }

        // Solapamiento dentro del mismo día, con el mismo criterio del backend.
        for (const dayList of blocksByDay.values()) {
            const sorted = [...dayList].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

            for (let index = 1; index < sorted.length; index += 1) {
                const previous = sorted[index - 1];
                const current = sorted[index];
                const previousIsValid = START_PATTERN.test(previous.startTime) && END_PATTERN.test(previous.endTime);
                const currentIsValid = START_PATTERN.test(current.startTime);

                if (!previousIsValid || !currentIsValid) continue;

                if (toMinutes(current.startTime) < toMinutes(previous.endTime)) {
                    next[`${current.key}-start`] = `Se cruza con ${previous.startTime} – ${previous.endTime}`;
                }
            }
        }

        setErrors(next);

        if (Object.keys(next).length > 0) {
            // Lleva al usuario al día del primer error — si estaba mirando otro
            // día, el guardado "no hacía nada" sin explicación.
            const firstInvalid = list.find((block) =>
                Object.keys(next).some((field) => field.startsWith(`${block.key}-`)));
            if (firstInvalid) setSelectedDay(firstInvalid.day);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Normaliza lo escrito ('8', '800', '00:00') antes de validar y enviar.
        const hours = normalizeDraftTimes(blocks);
        setBlocks(hours);
        if (!validate(hours)) return;

        const payload: HourFormValues[] = hours.map((block) => ({
            day_of_week: block.day,
            start_time: block.startTime,
            end_time: block.endTime,
            price: Number(block.price),
            is_closed: block.isClosed,
        }));

        setIsSaving(true);
        try {
            const { message } = await BusinessHourService.save(spacePublicId, payload);
            toast.success(message);
            onSaved?.();
            onClose();
        } catch (err) {
            toast.error(handleApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Horarios y precios" icon={Clock} size="lg">
            <div className="business_hour">
                {/* ── Días (izquierda) ─────────────────────────────── */}
                <aside className="bh_days">
                    {DAYS.map((day) => {
                        const list = blocks.filter((block) => block.day === day.value);
                        const isClosed = list.length > 0 && list.every((block) => block.isClosed);

                        return (
                            <button
                                key={day.value}
                                type="button"
                                className={`bh_day ${day.value === selectedDay ? 'is_active' : ''} ${isClosed ? 'is_closed' : ''}`}
                                aria-pressed={day.value === selectedDay}
                                onClick={() => setSelectedDay(day.value)}
                            >
                                <span className="bh_day_name">{day.label}</span>
                                <span className="bh_day_summary">{daySummary(day.value)}</span>
                            </button>
                        );
                    })}
                </aside>

                {/* ── Día elegido (derecha) ────────────────────────── */}
                <form className="bh_panel" onSubmit={handleSubmit} noValidate>
                    <header className="bh_panel_head">
                        <div className="bh_panel_title">
                            <h3>{DAYS.find((day) => day.value === selectedDay)?.label}</h3>
                            <p>
                                {dayBlocks.length === 0
                                    ? 'Sin bloques registrados'
                                    : `${dayBlocks.length} bloque${dayBlocks.length === 1 ? '' : 's'}`}
                            </p>
                        </div>
                        <div className='center' style={{gap: 10}}>
                            {/* Toggle del DÍA completo: abre o cierra todos sus bloques. */}
                            <ToggleField
                                name="day_status"
                                label={dayBlocks.length === 0 ? 'Sin bloques' : dayClosed ? 'Cerrado' : 'Abierto'}
                                checked={!dayClosed}
                                disabled={dayBlocks.length === 0}
                                onChange={(e) => toggleDay(e.target.checked)}
                            />
                            <Button text="Agregar bloque" icon={Plus} color="secondary" size="sm" type='button' onClick={addBlock} />
                        </div>
                    </header>

                    <div className="bh_blocks">
                        {dayBlocks.length > 0 ? (
                            <>
                                <div className="bh_blocks_head" aria-hidden>
                                    <span>Apertura</span>
                                    <span />
                                    <span>Cierre</span>
                                    <span>Precio</span>
                                    <span>Estado</span>
                                    <span />
                                </div>

                                {dayBlocks.map((block) => (
                                    <div className={`bh_block ${block.isClosed ? 'is_closed' : ''}`} key={block.key}>
                                        <TimeField
                                            name={`start_${block.key}`}
                                            ariaLabel="Hora de apertura"
                                            maxHour={23}
                                            value={block.startTime}
                                            error={errors[`${block.key}-start`]}
                                            onChange={(value) => updateBlock(block.key, { startTime: value })}
                                            onCommit={(value) => updateBlock(block.key, { startTime: value })}
                                        />
                                        <span className="bh_dash" aria-hidden>–</span>
                                        <TimeField
                                            name={`end_${block.key}`}
                                            ariaLabel="Hora de cierre (24:00 = fin del día)"
                                            maxHour={24}
                                            value={block.endTime}
                                            error={errors[`${block.key}-end`]}
                                            onChange={(value) => updateBlock(block.key, { endTime: value })}
                                            onCommit={(value) => updateBlock(block.key, { endTime: value === '00:00' ? END_OF_DAY : value })}
                                        />
                                        <InputField
                                            name={`price_${block.key}`}
                                            numberOnly
                                            value={block.price}
                                            placeholder="0.00"
                                            onChange={(e) => updateBlock(block.key, { price: e.target.value })}
                                            error={errors[`${block.key}-price`]}
                                        />

                                        {/* Toggle del bloque: afecta solo a este bloque. */}
                                        <ToggleField
                                            name={`closed_${block.key}`}
                                            label={block.isClosed ? 'Cerrado' : 'Abierto'}
                                            checked={!block.isClosed}
                                            onChange={(e) => updateBlock(block.key, { isClosed: !e.target.checked })}
                                        />

                                        <button
                                            type="button"
                                            className="bh_block_remove"
                                            aria-label="Quitar bloque"
                                            onClick={() => removeBlock(block.key)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                <p className="bh_hint">
                                    En el cierre, <strong>24:00</strong> (o 00:00) marca el fin del día.
                                </p>
                            </>
                        ) : (
                            <div className="bh_emptyy center">
                                <EmptyScreen message='No hay horarios configurados' onAction={addBlock} actionText='Agregar Bloque' iconBtn={Plus} />
                            </div>
                        )}
                    </div>

                    <FormActions>
                        <Button text="Cancelar" icon={X} color="secondary" type="button" onClick={onClose} />
                        <Button text="Guardar horarios" icon={UploadCloud} type="submit" loading={isSaving} />
                    </FormActions>
                </form>
            </div>
        </Modal>
    );
};

export default BussinesHour;
