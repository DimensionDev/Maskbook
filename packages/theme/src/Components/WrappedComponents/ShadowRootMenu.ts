import { Menu } from '@mui/material'
import { createShadowRootForwardedComponent } from '../../ShadowRoot/index.js'

export const ShadowRootMenu = createShadowRootForwardedComponent(Menu)
ShadowRootMenu.displayName = 'ShadowRootTooltip'
