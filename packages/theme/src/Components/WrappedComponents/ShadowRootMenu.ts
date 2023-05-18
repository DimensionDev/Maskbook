import { Menu } from '@mui/material'
import { createShadowRootForwardedComponent } from '../../entry.js'

export const ShadowRootMenu = createShadowRootForwardedComponent(Menu)
ShadowRootMenu.displayName = 'ShadowRootTooltip'
