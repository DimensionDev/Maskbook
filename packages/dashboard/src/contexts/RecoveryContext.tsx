import { noop } from 'lodash-es'
import {
    createContext,
    memo,
    useState,
    type ReactNode,
    useMemo,
    type PropsWithChildren,
    useContext,
    useCallback,
} from 'react'

interface ContextOptions {
    SubmitOutlet: ReactNode
    fillSubmitOutlet(outlet: ReactNode): () => void
}

export const RecoveryContext = createContext<ContextOptions>({
    SubmitOutlet: null,
    fillSubmitOutlet: () => noop,
})

RecoveryContext.displayName = 'RecoveryContext'

export const PersonaRecoveryProvider = memo<PropsWithChildren<{}>>(function PersonaRecoveryProvider({ children }) {
    const [outlet, setOutlet] = useState<ReactNode>(null)
    const fillSubmitOutlet = useCallback((outlet: ReactNode) => {
        setOutlet(outlet)
        return () => setOutlet(null)
    }, [])

    const contextValue = useMemo(
        () => ({
            SubmitOutlet: outlet,
            fillSubmitOutlet,
        }),
        [outlet],
    )

    return <RecoveryContext.Provider value={contextValue}>{children}</RecoveryContext.Provider>
})

export function usePersonaRecovery() {
    return useContext(RecoveryContext)
}
