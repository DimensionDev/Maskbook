import { pick } from 'lodash-unified'
import { createContext, FC, useContext, useMemo, useState } from 'react'
import type { SharedComponentOverwrite } from './types'

interface ContextOptions {
    networkIdentifier: string
    componentOverwrite: SharedComponentOverwrite
    updateOverwrite(overwrite: SharedComponentOverwrite): void
    updateNetworkIdentifier(snsId: string): void
}

// We can use this from outside of components or hooks
export const staticSharedUI: ContextOptions = {
    networkIdentifier: 'unknown',
    componentOverwrite: {},
    updateOverwrite: (overwrite: SharedComponentOverwrite) => {
        staticSharedUI.componentOverwrite = overwrite
    },
    updateNetworkIdentifier: (snsId: string) => {
        staticSharedUI.networkIdentifier = snsId
    },
}

const BaseUIContext = createContext<ContextOptions>(staticSharedUI)

export const BaseSharedUIProvider: FC = ({ children }) => {
    const [overwrite, setOverwrite] = useState<SharedComponentOverwrite>(staticSharedUI.componentOverwrite)
    const [snsId, setSnsId] = useState(staticSharedUI.networkIdentifier)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: snsId,
            componentOverwrite: overwrite,
            updateOverwrite: setOverwrite,
            updateNetworkIdentifier: setSnsId,
        }
        Object.assign(staticSharedUI, pick(value, ['networkIdentifier', 'componentOverwrite']))
        return value
    }, [snsId, overwrite])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
