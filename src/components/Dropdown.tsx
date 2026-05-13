import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Dropdown.module.css';

type Option = { value: string; label: string };

type DropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'default' | 'compact';
};

export function Dropdown({ options, value, onChange, placeholder = 'Select…', size = 'default' }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(-1);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const isCompact = size === 'compact';

  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      setOpen(true);
      setFocused(0);
      return;
    }
    if (open) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocused((f) => Math.min(f + 1, options.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocused((f) => Math.max(f - 1, 0));
      } else if (event.key === 'Enter' && focused >= 0) {
        event.preventDefault();
        onChange(options[focused].value);
        setOpen(false);
      }
    }
  }

  React.useEffect(() => {
    if (open && focused >= 0 && listRef.current) {
      const item = listRef.current.children[focused] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focused, open]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${styles.trigger} ${isCompact ? styles.compact : ''}`}
        onClick={() => { setOpen((o) => !o); setFocused(-1); }}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown className={styles.chevron} size={10} aria-hidden="true" />
      </button>
      {open && (
        <ul className={styles.list} ref={listRef} role="listbox">
          {options.map((option, index) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                className={`${styles.option} ${isCompact ? styles.compact : ''}`}
                onMouseEnter={() => setFocused(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(option.value);
                  setOpen(false);
                }}
                tabIndex={-1}
                type="button"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
