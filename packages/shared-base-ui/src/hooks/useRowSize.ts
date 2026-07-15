import { useLayoutEffect, useState } from 'react'

export function useRowSize() {
    const [rowSize, setRowSize] = useState(54)

    useLayoutEffect(() => {
        try {
            const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
            // eslint-disable-next-line @eslint-react/set-state-in-effect
            setRowSize(fontSize * 4)
        } catch {
            // eslint-disable-next-line @eslint-react/set-state-in-effect
            setRowSize(60)
        }
    }, [])
    return rowSize
}
