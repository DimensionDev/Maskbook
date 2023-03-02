import {
    cloneElement,
    createContext,
    type FC,
    memo,
    type ReactElement,
    type RefObject,
    useContext,
    useMemo,
    useRef,
} from 'react'

interface Options {
    boundaryRef: RefObject<HTMLElement>
}

const BoundaryContext = createContext<Options>({
    boundaryRef: { current: null },
})

interface BoundaryProps {
    children: ReactElement
}

export const Boundary: FC<BoundaryProps> = memo(({ children }) => {
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
