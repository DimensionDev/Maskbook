import { Tooltip } from '@mui/material'
import { createShadowRootForwardedPopperComponent } from '../../entry.js'

export const ShadowRootTooltip = createShadowRootForwardedPopperComponent(Tooltip)
ShadowRootTooltip.displayName = 'ShadowRootTooltip'
