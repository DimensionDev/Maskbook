/// <reference types="./extended.d.ts" />
import { Menu, Popper, Tooltip } from '@mui/material'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './ShadowRoot/Portal.js'

type SFC<T> = T & { displayName?: string }

export const ShadowRootTooltip: SFC<typeof Tooltip> = createShadowRootForwardedPopperComponent(Tooltip) as any
ShadowRootTooltip.displayName = 'ShadowRootTooltip'

export const ShadowRootMenu: SFC<typeof Menu> = createShadowRootForwardedComponent(Menu) as any
ShadowRootMenu.displayName = 'ShadowRootTooltip'

export const ShadowRootPopper: SFC<typeof Popper> = createShadowRootForwardedComponent(Popper) as any
ShadowRootPopper.displayName = 'ShadowRootTooltip'

export * from './entry-base.js'
export * from './Components/index.js'
export * from './hooks/index.js'
