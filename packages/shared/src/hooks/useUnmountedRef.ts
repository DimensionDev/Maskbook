import { useEffect, useRef } from 'react'

export function useUnmountedRef() {
    const unmountedRef = useRef(false)
    useEffect(() => {
        unmountedRef.current = false
        return () => {
            unmountedRef.current = true
        }
    }, [])
    return unmountedRef
}
