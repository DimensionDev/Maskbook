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

    const callbackRef = useRef(callback)
    callbackRef.current = callback
    useEffect(() => {
        if (!intersection?.isIntersecting) return
        callbackRef.current(intersection)
    }, [intersection])

    return (
        <Stack pt={1} ref={elementRef} justifyContent="center" direction="row">
            {children}
        </Stack>
    )
})
