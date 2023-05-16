import { useState, useEffect, useRef, type RefObject } from 'react'

export function useDetectOverflow<T extends HTMLDivElement>(): [overflow: boolean, ref: RefObject<T>] {
    const ref = useRef<T>(null)
    const [overflow, setOverflow] = useState(false)
    useEffect(() => {
        if (ref.current) {
            setOverflow(ref.current.offsetWidth !== ref.current.scrollWidth)
        }
    }, [ref.current])

    return [overflow, ref]
}
