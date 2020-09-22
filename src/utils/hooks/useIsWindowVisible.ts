import { useState, useCallback, useEffect } from 'react'

export function useIsWindowVisible() {
    const [visible, setVisible] = useState(false)
    const listener = useCallback(() => {
        setVisible(document.visibilityState === 'visible')
    }, [setVisible])

    useEffect(() => {
        document.addEventListener('visibilitychange', listener)
        window.onfocus = listener
        return () => {
            document.removeEventListener('visibilitychange', listener)
        }
    }, [listener])
    return visible
}
