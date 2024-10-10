import { useLayoutEffect, useState } from 'react'

export function useRowSize() {
    const [rowSize, setRowSize] = useState(54)

    useLayoutEffect(() => {
        try {
            const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
            // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
            setRowSize(fontSize * 4)
        } catch {
            // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
            setRowSize(60)
        }
    }, [])
    return rowSize
}
