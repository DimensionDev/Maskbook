import { Portal, type PortalProps } from '@mui/material'
import { memo } from 'react'
import { useOutletContext } from 'react-router-dom'

export interface PortalContainerProps {
    portalContainerRef: React.RefObject<HTMLDivElement | null>
}

interface OutletPortalProps extends Omit<PortalProps, 'container'> {}
export const OutletPortal = memo<OutletPortalProps>(function OutletPortal(props) {
    const { portalContainerRef } = useOutletContext<PortalContainerProps>()
    return <Portal container={() => portalContainerRef.current} {...props}></Portal>
})
