import { pick } from 'lodash-unified'
import { createContext, FC, useContext, useMemo, useState } from 'react'
import type { RuntimeComponentOverwrite } from './types'

interface ContextOptions {
    networkIdentifier: string
    componentOverwrite: RuntimeComponentOverwrite
    updateOverwrite(overwrite: RuntimeComponentOverwrite): void
    updateNetworkIdentifier(snsId: string): void
}

// We can use this from outside of components or hooks
export const staticBaseUIRuntime: ContextOptions = {
    networkIdentifier: 'unknown',
    componentOverwrite: {},
    updateOverwrite: (overwrite: RuntimeComponentOverwrite) => {
        staticBaseUIRuntime.componentOverwrite = overwrite
    },
    updateNetworkIdentifier: (snsId: string) => {
        staticBaseUIRuntime.networkIdentifier = snsId
    },
}

const BaseUIContext = createContext<ContextOptions>(staticBaseUIRuntime)

export const BaseUIRuntimeProvider: FC = ({ children }) => {
    const [overwrite, setOverwrite] = useState<RuntimeComponentOverwrite>(staticBaseUIRuntime.componentOverwrite)
    const [snsId, setSnsId] = useState(staticBaseUIRuntime.networkIdentifier)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: snsId,
            componentOverwrite: overwrite,
            updateOverwrite: setOverwrite,
            updateNetworkIdentifier: setSnsId,
        }
        Object.assign(staticBaseUIRuntime, pick(value, ['networkIdentifier', 'componentOverwrite']))
        return value
    }, [snsId, overwrite])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
