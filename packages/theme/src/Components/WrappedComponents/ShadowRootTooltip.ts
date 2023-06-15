import { Tooltip } from '@mui/material'
import { createShadowRootForwardedPopperComponent } from '../../ShadowRoot/index.js'

export const ShadowRootTooltip = createShadowRootForwardedPopperComponent(Tooltip)
ShadowRootTooltip.displayName = 'ShadowRootTooltip'
