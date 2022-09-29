import { useCallback, useEffect, useRef } from 'react'

export function useScrollLock(lock: boolean) {
    const recoverOverflow = useRef(false)

    const clearScrollLock = useCallback(() => {
        if (!recoverOverflow.current) return
        const html = document.documentElement
        html.style.overflow = 'auto scroll'
        html.style.removeProperty('margin-right')
        recoverOverflow.current = false
    }, [])

    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        if (lock) {
            body.style.removeProperty('overflow')
        }

        if (lock && html.style.overflow !== 'hidden') {
            html.style.overflow = 'hidden'
            html.style.marginRight = '17px'
            recoverOverflow.current = true
            return
        }
        if (!lock && recoverOverflow.current) {
            clearScrollLock()
        }
    }, [lock])

    return clearScrollLock
}
