'use client';

import { SHIRT_COLORS, type ShirtColor } from '@camisetas/contracts';
import { COLOR_LABELS, COLOR_SWATCHES } from '@/lib/labels';

type ColorPickerProps = {
  selected: ShirtColor[];
  onChange: (colors: ShirtColor[]) => void;
  errors?: string[] | undefined;
};

/**
 * A fieldset of checkboxes rather than clickable divs, so the whole control is reachable and
 * operable from the keyboard.
 */
export const ColorPicker = ({ selected, onChange, errors }: ColorPickerProps) => {
  const hasErrors = errors !== undefined && errors.length > 0;

  const toggle = (color: ShirtColor) => {
    onChange(
      selected.includes(color) ? selected.filter((item) => item !== color) : [...selected, color],
    );
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-ink-300 mb-1 text-sm">Colores</legend>
      <div className="flex flex-wrap gap-2">
        {SHIRT_COLORS.map((color) => {
          const isSelected = selected.includes(color);
          return (
            <label
              key={color}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2 text-sm transition-colors ${
                isSelected
                  ? 'border-celeste-400 bg-white/16'
                  : 'border-white/12 bg-white/6 hover:bg-white/12'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(color)}
                className="sr-only"
              />
              <span
                aria-hidden
                className="size-5 rounded-full border border-white/30"
                style={{ backgroundColor: COLOR_SWATCHES[color] }}
              />
              {COLOR_LABELS[color]}
            </label>
          );
        })}
      </div>
      {hasErrors ? (
        <p role="alert" className="text-danger-400 text-sm">
          {errors.join(' ')}
        </p>
      ) : null}
    </fieldset>
  );
};
