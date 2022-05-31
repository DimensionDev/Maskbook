import { useEffect, useRef } from 'react'

export const useElementOnScreen = (callback: (isIntersecting: boolean) => void, option: any) => {
    const ref = useRef(null)

    const handler = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries
        callback(entry.isIntersecting)
    }

    useEffect(() => {
        const ob = new IntersectionObserver(handler, option)
        if (ref.current) ob.observe(ref.current)

        return () => {
            if (ref.current) ob.unobserve(ref.current)
        }
    }, [handler, option])

    return ref
}
