import { useState, useCallback } from 'react'

export function useDetectOverflow(): [overflow: boolean, ref: (node: HTMLDivElement | null) => void] {
    const [overflow, setOverflow] = useState(false)
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (!node) return
        setOverflow(node.offsetWidth !== node.scrollWidth || node.offsetHeight !== node.scrollHeight)
    }, [])

    return [overflow, ref]
}
