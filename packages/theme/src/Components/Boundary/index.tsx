import {
    cloneElement,
    createContext,
    memo,
    type ReactElement,
    type RefObject,
    useContext,
    useMemo,
    useRef,
} from 'react'

const BoundaryContext = createContext({
    boundaryRef: { current: null } as RefObject<HTMLElement>,
})

export interface BoundaryProps {
    children: ReactElement
}

export const Boundary = memo(({ children }: BoundaryProps) => {
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
