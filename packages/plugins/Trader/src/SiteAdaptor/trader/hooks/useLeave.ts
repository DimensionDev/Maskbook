import { useEffect, useRef } from 'react'

export function useLeave() {
    const leaveRef = useRef(false)
    useEffect(() => {
        leaveRef.current = false
        return () => {
            leaveRef.current = true
        }
    }, [])
    return leaveRef
}
