import { createContext, useMemo, type PropsWithChildren, useContext } from 'react'

interface AnchorContextOptions {
    anchorEl: HTMLElement | null
    anchorBounding?: DOMRect
}

export const AnchorContext = createContext<AnchorContextOptions>({
    anchorEl: null,
})

interface Props {
    anchorEl: HTMLElement | null
    anchorBounding?: DOMRect
}
export function AnchorProvider({ anchorEl, anchorBounding, children }: PropsWithChildren<Props>) {
    const contextValue = useMemo(() => ({ anchorEl, anchorBounding }), [anchorEl, anchorBounding])
    return <AnchorContext value={contextValue}>{children}</AnchorContext>
}

export function useAnchor() {
    return useContext(AnchorContext)
}
