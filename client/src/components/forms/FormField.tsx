import { type ReactNode } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input, type InputProps } from '@/components/ui/Input';

// ============================================================
// FormField — RHF-connected input wrapper
// ============================================================

export interface FormFieldProps<T extends FieldValues> extends Omit<InputProps, 'name' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  ...inputProps
}: FormFieldProps<T>): ReactNode {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <Input
      {...inputProps}
      {...field}
      label={label}
      error={error?.message}
      helperText={helperText}
    />
  );
}
