import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EXTRACTOR_URL_PLACEHOLDER } from "@/features/extractor/constants";

type ExtractorFormProps = {
  error: string | null;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUrlChange: (value: string) => void;
  url: string;
};

export function ExtractorForm({
  error,
  isSubmitDisabled,
  isSubmitting,
  onSubmit,
  onUrlChange,
  url,
}: ExtractorFormProps) {
  return (
    <form className="relative flex flex-col gap-3" onSubmit={onSubmit}>
      <FieldGroup>
        <Field data-invalid={error ? "true" : undefined} className="gap-2">
          <FieldLabel htmlFor="url" className="sr-only">
            X post or X article URL
          </FieldLabel>

          <div className="input-shell relative flex flex-col gap-1.5 rounded-[1.3rem] border border-white/65 bg-background/78 p-1.5 dark:border-white/[0.08] dark:bg-black/10 sm:flex-row sm:items-center">
            <div
              aria-hidden="true"
              className="absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-primary/26 to-transparent opacity-90"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-2 right-18 hidden w-16 rounded-full bg-primary/8 blur-2xl sm:block dark:bg-primary/10"
            />
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder={EXTRACTOR_URL_PLACEHOLDER}
              className="h-11 rounded-[1.05rem] border-0 bg-transparent px-3 text-[16px] shadow-none transition-[background-color,color] duration-200 ease-out placeholder:text-muted-foreground/80 focus-visible:bg-background/82 focus-visible:ring-0 dark:focus-visible:bg-white/[0.03] sm:flex-1"
              aria-invalid={error ? "true" : undefined}
            />

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitDisabled}
              className="h-11 rounded-[1.05rem] px-4 shadow-sm shadow-primary/10 transition-[transform,box-shadow,background-color,opacity] duration-200 ease-out hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/18 sm:min-w-28"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Extracting
                </>
              ) : (
                "Extract"
              )}
            </Button>
          </div>

          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
    </form>
  );
}
