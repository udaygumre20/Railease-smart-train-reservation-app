import { type ReactNode } from 'react';
import { FormProvider, useForm, type UseFormProps, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

// ============================================================
// Form — wrapper with Zod validation + FormProvider
// ============================================================

export interface FormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  onSubmit: SubmitHandler<T>;
  defaultValues?: UseFormProps<T>['defaultValues'];
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
  id,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <FormProvider {...methods}>
      <form
        id={id}
        className={className}
        onSubmit={(e) => void methods.handleSubmit(onSubmit)(e)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
