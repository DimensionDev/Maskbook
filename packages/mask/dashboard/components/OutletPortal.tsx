import { Portal, type PortalProps } from '@mui/material'
import { memo } from 'react'
import { useOutletContext } from 'react-router-dom'

export interface PortalContainerProps {
    portalContainer: HTMLDivElement | null
}

interface OutletPortalProps extends Omit<PortalProps, 'container'> {}
export const OutletPortal = memo<OutletPortalProps>(function OutletPortal(props) {
    const { portalContainer } = useOutletContext<PortalContainerProps>()
    return <Portal container={portalContainer} {...props}></Portal>
})
