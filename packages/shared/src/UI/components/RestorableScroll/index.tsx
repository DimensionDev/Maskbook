import { memo, useRef, type ReactElement, cloneElement, useLayoutEffect, type RefObject } from 'react'
import { createContainer } from '@masknet/shared-base-ui'

function useScrollState() {
    return useRef(new Map<string, number>())
}

export const RestorableScrollContext = createContainer(useScrollState)
RestorableScrollContext.Provider.displayName = 'RestorableScrollProvider'

interface Props<T> {
    scrollKey: string
    targetRef?: RefObject<HTMLElement | null>
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<T & { ref: RefObject<HTMLElement | null> | undefined }>
}

export const RestorableScroll = memo(function RestorableScroll<T>({ scrollKey, targetRef, children }: Props<T>) {
    const containerRef = useRef<HTMLElement>(null)
    const mapRef = RestorableScrollContext.useContainer()

    useLayoutEffect(() => {
        const target = targetRef?.current || containerRef.current
        if (!target) return

        // eslint-disable-next-line react-compiler/react-compiler
        target.scrollTop = mapRef.current.get(scrollKey) || 0
        return () => {
            mapRef.current.set(scrollKey, target.scrollTop)
        }
    }, [scrollKey])

    return cloneElement(children, { ...children.props, ref: targetRef ? undefined : containerRef })
})
