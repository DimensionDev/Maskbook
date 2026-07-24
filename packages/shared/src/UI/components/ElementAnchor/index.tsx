import { memo, useEffect, useRef } from 'react'
import { useIntersectionObserver } from '@react-hookz/web'
import { Stack, type StackProps } from '@mui/material'

interface ElementAnchorProps extends StackProps {
    callback: (intersection: IntersectionObserverEntry | undefined) => void
}

export const ElementAnchor = memo<ElementAnchorProps>(({ callback, children, ...rest }) => {
    const elementRef = useRef<HTMLDivElement>(null!)
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
        <Stack
            ref={elementRef}
            direction="row"
            {...rest}
            sx={[
                { pt: 1, justifyContent: 'center', alignItems: 'center' },
                ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
            ]}>
            {children}
        </Stack>
    )
})

ElementAnchor.displayName = 'ElementAnchor'
