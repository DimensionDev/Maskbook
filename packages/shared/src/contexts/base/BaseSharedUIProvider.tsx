import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ProviderType } from '@masknet/web3-shared-evm'
import { createContext, FC, useContext, useMemo } from 'react'
import { useValueRef } from '../../hooks'
import type { SharedComponentOverwrite } from './types'

export const sharedUINetworkIdentifier = new ValueRef('unknown')
export const sharedUIComponentOverwrite = new ValueRef<SharedComponentOverwrite>({})
export const sharedProviderType = new ValueRef<ProviderType>(ProviderType.MaskWallet)

interface ContextOptions {
    networkIdentifier: string
    componentOverwrite: SharedComponentOverwrite
    providerType: ProviderType
}

const BaseUIContext = createContext<ContextOptions>({
    networkIdentifier: sharedUINetworkIdentifier.value,
    componentOverwrite: sharedUIComponentOverwrite.value,
    providerType: sharedProviderType.value,
})

export const BaseSharedUIProvider: FC = ({ children }) => {
    const snsId = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)
    const providerType = useValueRef(sharedProviderType)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: snsId,
            componentOverwrite: overwrite,
            providerType,
        }
        return value
    }, [snsId, overwrite])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
