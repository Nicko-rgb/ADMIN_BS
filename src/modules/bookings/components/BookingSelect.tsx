import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { BookingSelectProps } from '../interfaces/booking.interface';
import '../styles/BookingSelect.css';

/** Selector del calendario con opciones superpuestas, sin desplazar el contenido. */
export const BookingSelect = ({ label, icon: Icon, options, value, emptyMessage, onChange }: BookingSelectProps) => {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef({ text: '', time: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const selectedIndex = options.findIndex((option) => option.publicId === value);
    const selected = options[selectedIndex];
    const open = isOpen && options.length > 0;

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, [open]);

    useEffect(() => {
        const menu = menuRef.current;
        const option = menu?.children[activeIndex] as HTMLElement | undefined;
        if (!open || !menu || !option) return;
        // Desplaza solo las opciones; el sidebar conserva su posición al abrir el menú.
        const top = option.offsetTop;
        const bottom = top + option.offsetHeight;
        if (top < menu.scrollTop) menu.scrollTop = top;
        else if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight;
    }, [open, activeIndex]);

    const openMenu = () => {
        setActiveIndex(Math.max(selectedIndex, 0));
        searchRef.current = { text: '', time: 0 };
        setIsOpen(true);
    };

    const choose = (publicId: string) => {
        onChange(publicId);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!options.length) return;
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                event.preventDefault();
                if (!open) openMenu();
                else setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
                return;
            case 'Home':
            case 'End':
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
                return;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (open && options[activeIndex]) choose(options[activeIndex].publicId);
                else openMenu();
                return;
            case 'Escape':
                if (open) {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen(false);
                }
                return;
            case 'Tab':
                setIsOpen(false);
                return;
        }

        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            const now = Date.now();
            const text = (now - searchRef.current.time < 700 ? searchRef.current.text : '') + event.key;
            searchRef.current = { text, time: now };
            const normalize = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const index = options.findIndex((option) => normalize(option.name).startsWith(normalize(text)));
            if (index >= 0) {
                setIsOpen(true);
                setActiveIndex(index);
            }
        }
    };

    return (
        <div className="booking_select" ref={rootRef} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
        }}>
            <div className="booking_select_label">
                <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
                <span aria-hidden="true">{options.length}</span>
            </div>
            <button
                ref={triggerRef}
                id={`${id}-trigger`}
                type="button"
                role="combobox"
                className="booking_select_trigger"
                aria-labelledby={`${id}-label ${id}-value`}
                aria-expanded={open}
                aria-controls={open ? `${id}-options` : undefined}
                aria-haspopup="listbox"
                aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
                disabled={!options.length}
                onClick={() => open ? setIsOpen(false) : openMenu()}
                onKeyDown={handleKeyDown}
            >
                <Icon size={16} className="booking_select_icon" aria-hidden="true" />
                <span id={`${id}-value`} className="booking_select_value" title={selected?.name}>{selected?.name ?? emptyMessage}</span>
                <ChevronDown size={15} className="booking_select_arrow" aria-hidden="true" />
            </button>
            {open && (
                <div ref={menuRef} id={`${id}-options`} className="booking_select_menu" role="listbox" aria-labelledby={`${id}-label`}>
                    {options.map((option, index) => (
                        <div
                            key={option.publicId}
                            id={`${id}-option-${index}`}
                            role="option"
                            aria-selected={option.publicId === value}
                            className={`booking_select_option${index === activeIndex ? ' is_active' : ''}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => choose(option.publicId)}
                        >
                            <span>{option.name}</span>
                            {option.publicId === value && <Check size={14} aria-hidden="true" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
