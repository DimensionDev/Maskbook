import { Menu, Popper, Tooltip } from '@mui/material'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './Portal'

export const ShadowRootTooltip: typeof Tooltip = createShadowRootForwardedPopperComponent(Tooltip) as any
export const ShadowRootMenu: typeof Menu = createShadowRootForwardedComponent(Menu) as any
export const ShadowRootPopper: typeof Popper = createShadowRootForwardedComponent(Popper) as any
