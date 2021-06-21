import { useMemo } from 'react'
import { Remarkable } from 'remarkable'

export function useRemarkable(md: string) {
    return useMemo(() => {
        const remarkable = new Remarkable()
        return remarkable.render(md)
    }, [md])
}
