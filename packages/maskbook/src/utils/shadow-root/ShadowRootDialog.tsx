import { useRef } from 'react'
import { Dialog, withMobileDialog, DialogProps } from '@material-ui/core'
import '../../utils/shadow-root/ShadowRootPortal'
import { PortalShadowRoot } from '../../utils/shadow-root/ShadowRootPortal'
import { useSheetsRegistryStyles } from './renderInShadowRoot'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary'

const ResponsiveDialog = withMobileDialog({ breakpoint: 'xs' })(Dialog)

/**
 * This is the low-level API to rendering a dialog.
 * Please use InjectedDialog if possible.
 */
export default function ShadowRootDialog(_props: DialogProps) {
    const ref = useRef<HTMLDivElement>(null)
    const styles = useSheetsRegistryStyles(ref.current)

    // ? I need the render tree to get the shadowroot. Is the extra div must be rendered?
    // ? can style be transported to shadowroot directly instead of with dialog children?
    const { children, container, ...props } = _props
    return (
        <div ref={ref}>
            <ResponsiveDialog {...props} container={container ?? PortalShadowRoot}>
                <ErrorBoundary>
                    <style>{styles}</style>
                    {children}
                </ErrorBoundary>
            </ResponsiveDialog>
        </div>
    )
}
