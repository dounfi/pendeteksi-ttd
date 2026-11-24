import { useEffect, useId, useMemo, useRef } from "react";
import { FileUp, Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function usePreviews(files: File[]) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return urls;
}

export function UploadBox({
  label,
  files,
  onChange,
  max = 1,
  disabled,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const previews = usePreviews(files);
  const multi = max > 1;

  const open = (index: number | null) => {
    replaceIndex.current = index;
    if (inputRef.current) {
      inputRef.current.multiple = multi && index === null;
      inputRef.current.click();
    }
  };

  const onPick = (list: FileList | null) => {
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    const idx = replaceIndex.current;
    if (idx !== null) {
      const next = [...files];
      next[idx] = picked[0]!;
      onChange(next);
    } else {
      onChange([...files, ...picked].slice(0, max));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i: number) => onChange(files.filter((_, j) => j !== i));

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="font-semibold text-heading">
          {label}
        </label>
        {multi && (
          <span className="text-sm text-body">
            {files.length} dari {max} foto
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multi}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onPick(e.target.files)}
      />

      {files.length === 0 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => open(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            replaceIndex.current = null;
            onPick(e.dataTransfer.files);
          }}
          className="group flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-card border bg-surface-50 border-dashed border-primary-400 p-4 text-center transition-colors hover:border-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:aspect-[4/3.4]"
        >
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-surface-100 transition-colors group-hover:bg-surface-200">
            <FileUp className="h-11 w-11 text-primary-400" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-heading">Klik di sini atau tarik foto ke kotak ini</span>
          <span className="text-xs text-body">
            {multi ? `Format PNG atau JPG, 1 sampai ${max} foto` : "Format PNG atau JPG, 1 foto"}
          </span>
        </button>
      ) : (
        <div className="rounded-card border bg-surface-50 border-dashed border-primary-400 p-3 transition-colors hover:border-primary-600">
          <ul className={cn("grid gap-3", multi && files.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex min-w-0 flex-col gap-2">
                <img
                  src={previews[i]}
                  alt={`${label}${multi ? ` ${i + 1}` : ""}: ${f.name}`}
                  className={cn(
                    "w-full rounded-xl border border-surface-200 bg-background object-contain",
                    multi && files.length > 1 ? "aspect-[4/3]" : "aspect-[4/3.2]",
                  )}
                />
                <div className="flex justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="outline-brand"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    disabled={disabled}
                    onClick={() => open(i)}
                    aria-label={`Ganti ${label}${multi ? ` ${i + 1}` : ""}`}
                  >
                    <RefreshCw /> Ganti
                  </Button>
                  {multi && files.length > 1 && (
                    <Button
                      type="button"
                      variant="outline-brand"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled}
                      onClick={() => remove(i)}
                      aria-label={`Hapus ${label} ${i + 1}`}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {multi && files.length < max && (
            <Button
              type="button"
              variant="outline-brand"
              size="pill"
              className="mt-3 w-full"
              disabled={disabled}
              onClick={() => open(null)}
            >
              <Plus /> Tambah foto
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
