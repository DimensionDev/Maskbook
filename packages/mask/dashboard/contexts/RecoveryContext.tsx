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
    fillSubmitOutlet(outlet: ReactNode): void
}

export const RecoveryContext = createContext<ContextOptions>({
    SubmitOutlet: null,
    fillSubmitOutlet: () => noop,
})

RecoveryContext.displayName = 'RecoveryContext'

/**
 *
 * Render some component (the submit button) outside TabPanel's
 */
export const RecoveryProvider = memo<PropsWithChildren>(function RecoveryProvider({ children }) {
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

    return <RecoveryContext value={contextValue}>{children}</RecoveryContext>
})

export function usePersonaRecovery() {
    return useContext(RecoveryContext)
}
