import { useState } from 'react'
import { useTimeoutFn } from 'react-use'

export function useHeartBit(delay = 1000) {
    const [bit, setBit] = useState(0)
    const [, , reset] = useTimeoutFn(() => {
        setBit((x) => (x + 1) % Number.MAX_SAFE_INTEGER)
        reset()
    }, delay)
    return bit
}
