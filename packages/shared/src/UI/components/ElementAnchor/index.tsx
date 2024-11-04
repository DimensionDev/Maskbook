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
    // eslint-disable-next-line react-compiler/react-compiler
    callbackRef.current = callback
    useEffect(() => {
        if (!intersection?.isIntersecting) return
        callbackRef.current(intersection)
    }, [intersection])

    return (
        <Stack pt={1} ref={elementRef} justifyContent="center" alignItems="center" direction="row" {...rest}>
            {children}
        </Stack>
    )
})

ElementAnchor.displayName = 'ElementAnchor'
