import { useState, type RefObject, useEffect, useRef } from 'react'
import { useIntersection } from 'react-use'

export function useEverSeen<E = HTMLDivElement>(): [boolean, RefObject<E | null>] {
    const ref = useRef<E>(null)
    const [seen, setSeen] = useState(false)
    const nullRef = useRef<E>(null)
    const entry = useIntersection((seen ? nullRef : ref) as RefObject<HTMLElement>, {})
    useEffect(() => {
        if (entry?.isIntersecting) setSeen(true)
    }, [entry?.isIntersecting])

    return [seen, ref]
}
