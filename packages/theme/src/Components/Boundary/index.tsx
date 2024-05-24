import {
    cloneElement,
    createContext,
    memo,
    type RefObject,
    useContext,
    useMemo,
    useRef,
    type ReactElement,
} from 'react'

interface Options {
    boundaryRef: RefObject<HTMLElement | null>
}

const BoundaryContext = createContext<Options>({
    boundaryRef: { current: null },
})

interface BoundaryProps<T> {
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement<T & { ref: RefObject<HTMLElement | null> }>
}

export const Boundary = memo(function <T>({ children }: BoundaryProps<T>) {
    const boundaryRef = useRef<HTMLElement>(null)
    const contextValue = useMemo(() => ({ boundaryRef }), [boundaryRef.current])
    return (
        <BoundaryContext.Provider value={contextValue}>
            {cloneElement(children, { ...children.props, ref: boundaryRef })}
        </BoundaryContext.Provider>
    )
})

Boundary.displayName = 'Boundary'

export function useBoundary() {
    return useContext(BoundaryContext)
}
