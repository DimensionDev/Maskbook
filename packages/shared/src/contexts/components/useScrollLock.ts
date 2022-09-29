import { useEffect, useState } from 'react'

export function clearScrollLock(recover: boolean) {
    if (!recover) return
    const html = document.documentElement
    html.style.overflow = 'auto scroll'
    html.style.removeProperty('margin-right')
}

export function useScrollLock(lock: boolean) {
    const [recoverOverflow, setRecoverOverflow] = useState(false)

    useEffect(() => {
        if (lock) {
            const body = document.body
            body.style.removeProperty('overflow')
        }

        const html = document.documentElement
        if (lock && html.style.overflow !== 'hidden') {
            html.style.overflow = 'hidden'
            html.style.marginRight = '17px'
            setRecoverOverflow(true)
            return
        }
        if (!lock && recoverOverflow) {
            clearScrollLock(true)
        }
    }, [recoverOverflow, lock])

    return recoverOverflow
}
