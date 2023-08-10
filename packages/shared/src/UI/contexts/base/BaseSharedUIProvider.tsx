import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'
import { EnhanceableSite, ValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import type { SharedComponentOverwrite } from './types.js'

export const sharedUINetworkIdentifier = new ValueRef<EnhanceableSite>(EnhanceableSite.Localhost)
export const sharedUIComponentOverwrite = new ValueRef<SharedComponentOverwrite>({})

interface ContextOptions {
    networkIdentifier: EnhanceableSite
    componentOverwrite: SharedComponentOverwrite
}

const BaseUIContext = createContext<ContextOptions>({
    networkIdentifier: sharedUINetworkIdentifier.value,
    componentOverwrite: sharedUIComponentOverwrite.value,
})
BaseUIContext.displayName = 'BaseUIContext'

export function BaseSharedUIProvider({ children }: PropsWithChildren<{}>) {
    const site = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: site,
            componentOverwrite: overwrite,
        }
        return value
    }, [site, overwrite])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
