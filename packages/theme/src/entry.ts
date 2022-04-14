/// <reference path="./extended.d.ts" />
import { Menu, Popper, Tooltip } from '@mui/material'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './ShadowRoot/Portal'

export const ShadowRootTooltip: typeof Tooltip = createShadowRootForwardedPopperComponent(Tooltip) as any
export const ShadowRootMenu: typeof Menu = createShadowRootForwardedComponent(Menu) as any
export const ShadowRootPopper: typeof Popper = createShadowRootForwardedComponent(Popper) as any

export * from './entry-base'
export * from './Components'
export * from './hooks'
