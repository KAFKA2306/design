import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import type { ReactNode } from 'react'

export type TabItem = {
  value: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}

export type TabsProps = Omit<TabsPrimitive.Root.Props, 'children'> & {
  items: readonly TabItem[]
}

function Tabs({ items, className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      {...props}
      className={['k-tabs', className].filter(Boolean).join(' ')}
    >
      <TabsPrimitive.List className="k-tabs-list">
        {items.map((item) => (
          <TabsPrimitive.Tab
            className="k-tabs-tab"
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.label}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Panel className="k-tabs-panel" key={item.value} value={item.value}>
          {item.content}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  )
}

export { Tabs }
