import { createContext, FC, PropsWithChildren, useContext, useMemo } from 'react'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import type { SharedComponentOverwrite } from './types.js'

export const sharedUINetworkIdentifier = new ValueRef('unknown')
export const sharedUIComponentOverwrite = new ValueRef<SharedComponentOverwrite>({})

interface ContextOptions {
    networkIdentifier: string
    componentOverwrite: SharedComponentOverwrite
}

const BaseUIContext = createContext<ContextOptions>({
    networkIdentifier: sharedUINetworkIdentifier.value,
    componentOverwrite: sharedUIComponentOverwrite.value,
})

export const BaseSharedUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    const snsId = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: snsId,
            componentOverwrite: overwrite,
        }
        return value
    }, [snsId, overwrite])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
