import { useCallback, useEffect, useRef } from 'react'

export function useScrollLock(lock: boolean) {
    const recoverOverflow = useRef(false)

    const unLockCallback = useCallback(() => {
        if (!recoverOverflow.current) return
        const html = document.documentElement
        html.style.overflow = 'auto scroll'
        html.style.removeProperty('margin-right')
        recoverOverflow.current = false
    }, [])

    const lockCallback = useCallback(() => {
        const html = document.documentElement
        if (html.style.overflow === 'hidden') return
        html.style.overflow = 'hidden'
        html.style.marginRight = '17px'
        recoverOverflow.current = true
    }, [])

    useEffect(() => {
        const body = document.body
        if (lock) {
            body.style.removeProperty('overflow')
            lockCallback()
            return
        }
        if (!lock && recoverOverflow.current) {
            unLockCallback()
        }
    }, [lock])

    return [unLockCallback, lockCallback] as const
}
