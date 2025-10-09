"use client"

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

interface StatusSwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  variant?: 'default' | 'success' | 'destructive'
}

function StatusSwitch({
  className,
  variant = 'default',
  ...props
}: StatusSwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        // Default variant
        variant === 'default' && 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        // Success variant (green when active)
        variant === 'success' && 'data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500',
        // Destructive variant (red when active)
        variant === 'destructive' && 'data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-green-500',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { StatusSwitch }




