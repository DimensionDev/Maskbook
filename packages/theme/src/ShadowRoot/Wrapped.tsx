import { Menu, Popper, Tooltip } from '@mui/material'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './Portal'

export const ShadowRootTooltip: typeof Tooltip = createShadowRootForwardedPopperComponent(Tooltip)
export const ShadowRootMenu: typeof Menu = createShadowRootForwardedComponent(Menu)
export const ShadowRootPopper: typeof Popper = createShadowRootForwardedComponent(Popper)
