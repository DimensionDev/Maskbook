import { useState, type RefObject, useEffect, useRef } from 'react'
import { useIntersection } from 'react-use'

export function useEverSeen(): [boolean, RefObject<HTMLDivElement>] {
    const ref = useRef(null)
    const [seen, setSeen] = useState(false)
    const nullRef = useRef(null)
    const entry = useIntersection(seen ? nullRef : ref, {})
    useEffect(() => {
        if (entry?.isIntersecting) setSeen(true)
    }, [entry?.isIntersecting])

    return [seen, ref]
}
