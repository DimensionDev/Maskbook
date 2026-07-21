import { Popper } from '@mui/material'
import { createShadowRootForwardedComponent } from '../../ShadowRoot/index.js'

export const ShadowRootPopper: typeof Popper = createShadowRootForwardedComponent(Popper) as typeof Popper
ShadowRootPopper.displayName = 'ShadowRootTooltip'
