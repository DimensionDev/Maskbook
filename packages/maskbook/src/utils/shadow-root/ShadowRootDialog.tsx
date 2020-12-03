import { useRef } from 'react'
import { Dialog, useTheme, DialogProps, useMediaQuery } from '@material-ui/core'
import '../../utils/shadow-root/ShadowRootPortal'
import { PortalShadowRoot } from '../../utils/shadow-root/ShadowRootPortal'
import { useSheetsRegistryStyles } from './renderInShadowRoot'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary'

/**
 * This is the low-level API to rendering a dialog.
 * Please use InjectedDialog if possible.
 */
export default function ShadowRootDialog(_props: DialogProps) {
    const ref = useRef<HTMLDivElement>(null)
    const styles = useSheetsRegistryStyles(ref.current)
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))

    // ? I need the render tree to get the shadowroot. Is the extra div must be rendered?
    // ? can style be transported to shadowroot directly instead of with dialog children?
    const { children, container, ...props } = _props
    return (
        <div ref={ref}>
            <Dialog fullScreen={fullScreen} {...props} container={container ?? PortalShadowRoot}>
                <ErrorBoundary>
                    <style>{styles}</style>
                    {children}
                </ErrorBoundary>
            </Dialog>
        </div>
    )
}
