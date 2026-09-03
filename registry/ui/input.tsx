import { Field as FieldPrimitive } from '@base-ui/react/field'
import { Input as InputPrimitive } from '@base-ui/react/input'
import type { ComponentProps, ReactNode } from 'react'

export type InputProps = ComponentProps<'input'> & {
  label: ReactNode
  error?: ReactNode
}

function Input({ label, error, className, ...props }: InputProps) {
  const invalid = Boolean(error)

  return (
    <FieldPrimitive.Root className="k-field" invalid={invalid}>
      <FieldPrimitive.Label className="k-field-label">{label}</FieldPrimitive.Label>
      <InputPrimitive
        {...props}
        className={['k-input', className].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
      />
      {error ? (
        <FieldPrimitive.Error className="k-field-error" match>
          {error}
        </FieldPrimitive.Error>
      ) : null}
    </FieldPrimitive.Root>
  )
}

export { Input }
