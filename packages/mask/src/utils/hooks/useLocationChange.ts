import { useEffect } from 'react'

export function useLocationChange(handler: (event?: Event) => void) {
    useEffect(() => {
        window.addEventListener('locationchange', handler)
        return () => window.removeEventListener('locationchange', handler)
    }, [handler])
}
