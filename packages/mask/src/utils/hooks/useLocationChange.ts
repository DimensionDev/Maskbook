import { useEffect } from 'react'

export const useLocationChange = (handler: () => void) => {
    useEffect(() => {
        window.addEventListener('locationchange', handler)
        return () => window.removeEventListener('locationchange', handler)
    }, [handler])
}
