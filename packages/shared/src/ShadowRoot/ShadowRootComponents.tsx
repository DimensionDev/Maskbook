import { Menu, Popper, Tooltip } from '@material-ui/core'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './Portal'

export const ShadowRootTooltip = createShadowRootForwardedPopperComponent(Tooltip)
export const ShadowRootMenu = createShadowRootForwardedComponent(Menu)
export const ShadowRootPopper = createShadowRootForwardedComponent(Popper)
