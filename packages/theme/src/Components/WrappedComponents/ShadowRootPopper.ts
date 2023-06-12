import { Popper } from '@mui/material'
import { createShadowRootForwardedComponent } from '../../ShadowRoot/index.js'

export const ShadowRootPopper = createShadowRootForwardedComponent(Popper)
ShadowRootPopper.displayName = 'ShadowRootTooltip'
