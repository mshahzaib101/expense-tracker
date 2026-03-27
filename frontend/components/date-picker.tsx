'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
};

const CALENDAR_HEIGHT = 330;

function eventWithinElement(
  event: MouseEvent,
  element: HTMLElement | null,
) {
  if (!element) {
    return false;
  }

  const eventPath = typeof event.composedPath === 'function' ? event.composedPath() : [];
  if (eventPath.includes(element)) {
    return true;
  }

  return event.target instanceof Node && element.contains(event.target);
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  clearable = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; dropUp: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < CALENDAR_HEIGHT;

    setPos({
      top: dropUp ? rect.top - CALENDAR_HEIGHT - 6 : rect.bottom + 6,
      left: rect.left,
      dropUp,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const calEl = calendarRef.current;

    function handleClickOutside(e: MouseEvent) {
      const wasInteracting = interactingRef.current;
      interactingRef.current = false;

      if (wasInteracting) return;

      if (
        eventWithinElement(e, triggerRef.current) ||
        eventWithinElement(e, calendarRef.current)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handlePositionChange() {
      calcPosition();
    }

    const stopTouch = (e: Event) => e.stopPropagation();
    const markInteracting = () => { interactingRef.current = true; };

    if (calEl) {
      calEl.addEventListener('touchstart', stopTouch);
      calEl.addEventListener('touchmove', stopTouch);
      calEl.addEventListener('touchend', stopTouch);
      calEl.addEventListener('pointerdown', markInteracting);
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handlePositionChange);
    window.addEventListener('scroll', handlePositionChange, true);
    return () => {
      interactingRef.current = false;
      if (calEl) {
        calEl.removeEventListener('touchstart', stopTouch);
        calEl.removeEventListener('touchmove', stopTouch);
        calEl.removeEventListener('touchend', stopTouch);
        calEl.removeEventListener('pointerdown', markInteracting);
      }
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handlePositionChange);
      window.removeEventListener('scroll', handlePositionChange, true);
    };
  }, [open, calcPosition]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            calcPosition();
          }
          setOpen((v) => !v);
        }}
        className={cn(
          'inline-flex h-11 w-full items-center gap-2 rounded-lg border border-transparent bg-muted/50 px-3 text-sm transition-colors cursor-pointer',
          'hover:bg-muted/80',
          !displayValue && 'text-muted-foreground',
          className,
        )}
      >
        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="flex-1 text-left truncate">
          {displayValue || placeholder}
        </span>
        {clearable && value && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setOpen(false);
            }}
            className="shrink-0 rounded-sm p-0.5 hover:bg-foreground/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {open && pos && createPortal(
        <div
          ref={calendarRef}
          data-date-picker-portal="true"
          className="fixed z-100 rounded-xl border bg-popover shadow-lg animate-fade-in-up pointer-events-auto"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={{
            top: pos.top,
            left: pos.left,
            animationDuration: '150ms',
          }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) => {
              if (date) onChange(toDateString(date));
              setOpen(false);
            }}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
