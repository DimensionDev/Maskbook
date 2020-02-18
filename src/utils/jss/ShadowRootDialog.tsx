import React from 'react'
import { Dialog, withMobileDialog } from '@material-ui/core'
import '../../utils/jss/ShadowRootPortal'
import { PortalShadowRoot } from '../../utils/jss/ShadowRootPortal'
import { useSheetsRegistryStyles } from './renderInShadowRoot'

const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

export default function ShadowRootDialog(_props: any) {
    const ref = React.useRef<HTMLDivElement>(null)
    const styles = useSheetsRegistryStyles(ref)

    // ? I need the render tree to get the shadowroot. Is the extra div must be rendered?
    // ? can style be transported to shadowroot directly instead of with dialog children?
    const { children, ...props } = _props
    return (
        <div ref={ref}>
            <ResponsiveDialog {...props} container={PortalShadowRoot}>
                <style>{styles}</style>
                {children}
            </ResponsiveDialog>
        </div>
    )
}
