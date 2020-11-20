import { Popper, PopperProps } from '@material-ui/core'
import { PortalShadowRoot } from './ShadowRootPortal'

export function ShadowRootPopper(props: PopperProps) {
    return <Popper container={PortalShadowRoot} {...props} />
}
