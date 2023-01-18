import type { PopperProps } from '@mui/material'
import { useBoundary } from '../Components/index.js'

export function useBoundedPopperProps() {
    const { boundaryRef } = useBoundary()

    const tooltipPopperProps: Partial<PopperProps> = {
        disablePortal: !!boundaryRef.current,
        placement: 'top',
        modifiers: [
            {
                name: 'flip',
                options: {
                    rootBoundary: boundaryRef.current,
                    boundary: boundaryRef.current,
                },
            },
        ],
    }

    return tooltipPopperProps
}
