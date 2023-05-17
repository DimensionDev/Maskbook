import * as mui from /* webpackDefer: true */ '@mui/material'
import { createShadowRootForwardedComponent, createShadowRootForwardedPopperComponent } from './ShadowRoot/Portal.js'

export const ShadowRootTooltip = createShadowRootForwardedPopperComponent(() => mui.Tooltip)
ShadowRootTooltip.displayName = 'ShadowRootTooltip'

export const ShadowRootMenu = createShadowRootForwardedComponent(() => mui.Menu)
ShadowRootMenu.displayName = 'ShadowRootTooltip'

export const ShadowRootPopper = createShadowRootForwardedComponent(() => mui.Popper)
ShadowRootPopper.displayName = 'ShadowRootTooltip'
