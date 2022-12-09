import { createContext, FC, memo, PropsWithChildren, RefObject, useContext } from 'react'

interface Options {
    boundaryRef: RefObject<HTMLElement>
}

const BoundaryContext = createContext<Options>({
    boundaryRef: { current: null },
})

interface BoundaryProps extends PropsWithChildren<Options> {}

export const Boundary: FC<BoundaryProps> = memo(({ children, boundaryRef }) => {
    return <BoundaryContext.Provider value={{ boundaryRef }}>{children}</BoundaryContext.Provider>
})

Boundary.displayName = 'Boundary'

export function useBoundary() {
    return useContext(BoundaryContext)
}
