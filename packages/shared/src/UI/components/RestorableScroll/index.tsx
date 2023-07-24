import { memo, useRef, type ReactElement, cloneElement, useLayoutEffect, type RefObject } from 'react'
import { createContainer } from 'unstated-next'

function useScrollState() {
    return useRef(new Map<string, number>())
}

export const RestorableScrollContext = createContainer(useScrollState)
RestorableScrollContext.Provider.displayName = 'RestorableScrollProvider'

interface Props {
    scrollKey: string
    targetRef?: RefObject<HTMLElement>
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement
}

export const RestorableScroll = memo(function RestorableScroll({ scrollKey, targetRef, children }: Props) {
    const containerRef = useRef<HTMLElement>(null)
    const mapRef = RestorableScrollContext.useContainer()

    useLayoutEffect(() => {
        const target = targetRef?.current || containerRef.current
        if (!target) return

        target.scrollTop = mapRef.current.get(scrollKey) || 0
        return () => {
            mapRef.current.set(scrollKey, target.scrollTop)
        }
    }, [scrollKey])

    return cloneElement(children, { ...children.props, ref: containerRef })
})
