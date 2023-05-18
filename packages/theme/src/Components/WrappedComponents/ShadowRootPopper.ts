import { Popper } from '@mui/material'
import { createShadowRootForwardedComponent } from '../../entry.js'

export const ShadowRootPopper = createShadowRootForwardedComponent(Popper)
ShadowRootPopper.displayName = 'ShadowRootTooltip'
