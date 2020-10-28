import { Popper, PopperProps } from '@material-ui/core'
import React from 'react'
import { PortalShadowRoot } from './ShadowRootPortal'

export function ShadowRootPopper(props: PopperProps) {
    return <Popper container={PortalShadowRoot} {...props} />
}
