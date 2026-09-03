import { Button as ButtonPrimitive } from '@base-ui/react/button'
import type { ReactNode } from 'react'

export type ButtonProps = ButtonPrimitive.Props & {
  loading?: boolean
  loadingLabel?: ReactNode
}

function Button({
  loading = false,
  loadingLabel = 'Loading',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      {...props}
      className={['k-button', className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
    >
      {loading ? loadingLabel : children}
    </ButtonPrimitive>
  )
}

export { Button }
