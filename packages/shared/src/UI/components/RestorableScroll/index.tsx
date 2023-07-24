import { memo, useRef, type ReactElement, cloneElement, useLayoutEffect } from 'react'
import { createContainer } from 'unstated-next'

function useScrollState() {
    return useRef(new Map<string, number>())
}

export const RestorableScrollContext = createContainer(useScrollState)
RestorableScrollContext.Provider.displayName = 'RestorableScrollProvider'

interface Props {
    scrollKey: string
    enabled?: boolean
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement
}

export const RestorableScroll = memo(function RestorableScroll({ scrollKey, enabled = true, children }: Props) {
    const containerRef = useRef<HTMLElement>(null)
    const mapRef = RestorableScrollContext.useContainer()

    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container || !enabled) return

        container.scrollTop = mapRef.current.get(scrollKey) || 0
        return () => {
            mapRef.current.set(scrollKey, container.scrollTop)
        }
    }, [scrollKey])

    return cloneElement(children, { ...children.props, ref: containerRef })
})
