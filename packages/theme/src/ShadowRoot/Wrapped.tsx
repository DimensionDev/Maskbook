import { Menu, Popper, Tooltip } from '@mui/material'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './Portal'

export const ShadowRootTooltip = createShadowRootForwardedPopperComponent(Tooltip)
export const ShadowRootMenu = createShadowRootForwardedComponent(Menu)
export const ShadowRootPopper = createShadowRootForwardedComponent(Popper)
