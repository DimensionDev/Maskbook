import { useRef } from 'react'
import { MenuProps, Menu } from '@material-ui/core'
import '../../utils/shadow-root/ShadowRootPortal'
import { PortalShadowRoot } from '../../utils/shadow-root/ShadowRootPortal'
import { useSheetsRegistryStyles } from './renderInShadowRoot'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary'

/**
 * This is the low-level API to rendering a menu.
 * Please use InjectedMenu if possible.
 */
export default function ShadowRootMenu(_props: MenuProps) {
    const ref = useRef<HTMLDivElement>(null)
    const styles = useSheetsRegistryStyles(ref.current)

    // ? I need the render tree to get the shadowroot. Is the extra div must be rendered?
    // ? can style be transported to shadowroot directly instead of with menu children?
    const { children, container, ...props } = _props
    return (
        <div ref={ref}>
            <ErrorBoundary>
                <Menu {...props} container={container ?? PortalShadowRoot}>
                    <style>{styles}</style>
                    {children}
                </Menu>
            </ErrorBoundary>
        </div>
    )
}
