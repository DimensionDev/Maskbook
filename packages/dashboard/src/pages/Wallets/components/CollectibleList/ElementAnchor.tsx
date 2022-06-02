import { Stack } from '@mui/material'
import { useIntersectionObserver } from '@react-hookz/web'
import { memo, useEffect, useRef } from 'react'

interface ElementAnchorProps {
    callback: (intersection: IntersectionObserverEntry | undefined) => void
    children: React.ReactNode
}

export const ElementAnchor = memo<ElementAnchorProps>(({ callback, children }) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const intersection = useIntersectionObserver(elementRef, {
        rootMargin: '200px',
    })

    useEffect(() => {
        if (!intersection?.isIntersecting) return
        callback(intersection)
    }, [intersection])

    return (
        <Stack py={2} ref={elementRef} justifyContent="center" direction="row">
            {children}
        </Stack>
    )
})
