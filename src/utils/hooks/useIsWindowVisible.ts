import { useState, useCallback, useEffect } from 'react'

export function useIsWindowVisible() {
    const [visible, setVisible] = useState(document.visibilityState === 'visible')
    const listener = useCallback(() => {
        setVisible(document.visibilityState === 'visible')
    }, [setVisible])

    useEffect(() => {
        document.addEventListener('visibilitychange', listener)
        return () => {
            document.removeEventListener('visibilitychange', listener)
        }
    }, [listener])
    return visible
}
