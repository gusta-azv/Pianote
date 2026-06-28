import { useLocale } from "@react-aria/i18n";
import { useNumberField } from "@react-aria/numberfield";
import { useNumberFieldState } from "@react-stately/numberfield";
import { useRef } from "react";

export const BpmInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const { locale } = useLocale();
  const state = useNumberFieldState({
    value,
    onChange,
    minValue: 1,
    maxValue: 300,
    locale,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { inputProps } = useNumberField(
    { label: "BPM", minValue: 1, maxValue: 300 },
    state,
    inputRef,
  );

  return (
    <div className="flex items-center gap-1 focus:outline-none">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-1 text-lg text-zinc-300 hover:text-emerald-500 transition-colors"
      >
        -
      </button>
      <input
        {...inputProps}
        ref={inputRef}
        className="w-12 text-center bg-zinc-700 rounded focus:outline-none focus-within:ring-2 focus-within:ring-emerald-500 transition"
      />
      <button
        onClick={() => onChange(Math.min(300, value + 1))}
        className="px-1 text-lg text-zinc-300 hover:text-emerald-500 transition-colors"
      >
        +
      </button>
    </div>
  );
};
