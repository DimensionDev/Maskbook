import { useState, useCallback } from 'react'

export function useDetectOverflow<T extends HTMLDivElement>(): [overflow: boolean, ref: (node: T | null) => void] {
    const [overflow, setOverflow] = useState(false)
    const ref = useCallback((node: T | null) => {
        if (node) setOverflow(node.offsetWidth !== node.scrollWidth || node.offsetHeight !== node.scrollHeight)
    }, [])

    return [overflow, ref]
}
