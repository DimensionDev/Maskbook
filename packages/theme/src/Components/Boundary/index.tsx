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
BoundaryContext.displayName = 'BoundaryContext'

interface BoundaryProps<T> {
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<T & { ref: RefObject<HTMLElement | null> }>
}

export const Boundary = memo(function <T>({ children }: BoundaryProps<T>) {
    const boundaryRef = useRef<HTMLElement>(null)
    const contextValue = useMemo(() => ({ boundaryRef }), [boundaryRef.current])
    // eslint-disable-next-line @eslint-react/no-clone-element
    const child = cloneElement(children, { ...children.props, ref: boundaryRef })
    return <BoundaryContext value={contextValue}>{child}</BoundaryContext>
})

Boundary.displayName = 'Boundary'

export function useBoundary() {
    return useContext(BoundaryContext)
}
