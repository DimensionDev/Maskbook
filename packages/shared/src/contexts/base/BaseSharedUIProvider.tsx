import { ValueRef } from '@dimensiondev/holoflows-kit'
import { createContext, FC, PropsWithChildren, useContext, useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import type { SharedComponentOverwrite } from './types'
import { ProviderType } from '@masknet/web3-shared-evm'
import { NextIDPlatform } from '@masknet/shared-base'

export const sharedUINetworkIdentifier = new ValueRef('unknown')
export const sharedUIComponentOverwrite = new ValueRef<SharedComponentOverwrite>({})
export const sharedProviderType = new ValueRef<ProviderType>(ProviderType.MaskWallet)
export const sharedNextIDPlatform = new ValueRef<NextIDPlatform>(NextIDPlatform.Twitter)

interface ContextOptions {
    networkIdentifier: string
    componentOverwrite: SharedComponentOverwrite
    providerType: ProviderType
    nextIDPlatform: NextIDPlatform
}

const BaseUIContext = createContext<ContextOptions>({
    networkIdentifier: sharedUINetworkIdentifier.value,
    componentOverwrite: sharedUIComponentOverwrite.value,
    providerType: sharedProviderType.value,
    nextIDPlatform: sharedNextIDPlatform.value,
})

export const BaseSharedUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    const snsId = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)
    const providerType = useValueRef(sharedProviderType)
    const nextIDPlatform = useValueRef(sharedNextIDPlatform)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: snsId,
            componentOverwrite: overwrite,
            providerType,
            nextIDPlatform,
        }
        return value
    }, [snsId, overwrite])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
