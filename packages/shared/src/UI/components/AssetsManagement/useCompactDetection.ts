import { useLayoutEffect, useRef, useState } from 'react'

// TODO we can't use @container query inside shadow DOM, so we check if it's
// compact manually.
export function useCompactDetection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [compact, setCompact] = useState(false)

    useLayoutEffect(() => {
        if (!containerRef.current) return
        // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
        setCompact(containerRef.current?.offsetWidth < 100)
    }, [])

    return { compact, containerRef }
}
