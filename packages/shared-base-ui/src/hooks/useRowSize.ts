import { useLayoutEffect, useState } from 'react'

export function useRowSize() {
    const [rowSize, setRowSize] = useState(54)

    useLayoutEffect(() => {
        try {
            const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
            setRowSize(fontSize * 4)
        } catch {
            setRowSize(60)
        }
    }, [])
    return rowSize
}
