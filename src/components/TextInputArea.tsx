"use client";

import { Textarea } from "@/components/ui/textarea";

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TextInputArea({
  value,
  onChange,
  disabled,
}: TextInputAreaProps) {
  const length = value.length;
  const isValid = length >= MIN_LENGTH && length <= MAX_LENGTH;
  const showError = length > 0 && !isValid;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Wklej tekst, z którego chcesz wygenerować fiszki (1000-10000 znaków)..."
        className="min-h-[200px] resize-y"
        aria-label="Tekst źródłowy do generowania fiszek"
      />
      <div className="flex justify-end">
        <span
          className={`text-sm tabular-nums ${
            showError
              ? "text-destructive font-medium"
              : "text-muted-foreground"
          }`}
        >
          {length} / {MIN_LENGTH}-{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
