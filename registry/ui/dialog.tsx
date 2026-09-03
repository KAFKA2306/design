import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'
import { Button } from './button'

export type DialogProps = {
  trigger: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

function Dialog({ trigger, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger render={<Button />}>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="k-dialog-backdrop" />
        <DialogPrimitive.Popup className="k-dialog-popup">
          <div className="k-dialog-header">
            <DialogPrimitive.Title className="k-dialog-title">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="k-dialog-description">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          {children ? <div className="k-dialog-body">{children}</div> : null}
          <div className="k-dialog-actions">
            <DialogPrimitive.Close render={<Button className="k-button-secondary" />}>
              Close
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { Dialog }
