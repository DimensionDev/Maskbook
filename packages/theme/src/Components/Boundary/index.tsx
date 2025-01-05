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

interface BoundaryProps {
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement<any>
}

export const Boundary = memo(({ children }: BoundaryProps) => {
    const boundaryRef = useRef<HTMLElement>(null)
    const contextValue = useMemo(() => ({ boundaryRef }), [boundaryRef.current])
    return (
        <BoundaryContext value={contextValue}>
            {cloneElement(children, { ...children.props, ref: boundaryRef })}
        </BoundaryContext>
    )
})

Boundary.displayName = 'Boundary'

export function useBoundary() {
    return useContext(BoundaryContext)
}
