import { Menu, Popper } from '@material-ui/core'
import { createShadowRootForwardedComponent } from './usePortalShadowRoot'
export const ShadowRootMenu = createShadowRootForwardedComponent(Menu)
export const ShadowRootPopper = createShadowRootForwardedComponent(Popper)
