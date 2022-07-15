import { ValueRef } from '@dimensiondev/holoflows-kit'
import { createContext, FC, PropsWithChildren, useContext, useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import type { SharedComponentOverwrite } from './types'
import { NextIDPlatform } from '@masknet/shared-base'

export const sharedUINetworkIdentifier = new ValueRef('unknown')
export const sharedUIComponentOverwrite = new ValueRef<SharedComponentOverwrite>({})
export const nextIDPlatform = new ValueRef<NextIDPlatform>(NextIDPlatform.Twitter)

interface ContextOptions {
    networkIdentifier: string
    componentOverwrite: SharedComponentOverwrite
    nextIDPlatform: NextIDPlatform
}

const BaseUIContext = createContext<ContextOptions>({
    networkIdentifier: sharedUINetworkIdentifier.value,
    componentOverwrite: sharedUIComponentOverwrite.value,
    nextIDPlatform: nextIDPlatform.value,
})

export const BaseSharedUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    const snsId = useValueRef(sharedUINetworkIdentifier)
    const overwrite = useValueRef(sharedUIComponentOverwrite)
    const _nextIDPlatform = useValueRef(nextIDPlatform)

    const contextValue = useMemo(() => {
        const value: ContextOptions = {
            networkIdentifier: snsId,
            componentOverwrite: overwrite,
            nextIDPlatform: _nextIDPlatform,
        }
        return value
    }, [snsId, overwrite, _nextIDPlatform])

    return <BaseUIContext.Provider value={contextValue}>{children}</BaseUIContext.Provider>
}

export const useBaseUIRuntime = () => {
    return useContext(BaseUIContext)
}
