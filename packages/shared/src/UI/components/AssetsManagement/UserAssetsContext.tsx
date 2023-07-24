import { memo, type PropsWithChildren } from 'react'
import { ChainRuntimeProvider, type ChainRuntimeProviderProps } from './ChainRuntimeProvider.js'
import { AssetsProvider } from './AssetsProvider.js'
import { CollectionsProvider, type CollectionsProviderProps } from './CollectionsProvider.js'

interface UserAssetsProviderProps extends ChainRuntimeProviderProps, CollectionsProviderProps {}

export const UserAssetsProvider = memo<PropsWithChildren<UserAssetsProviderProps>>(function UserAssetsProvider({
    pluginID,
    account,
    defaultChainId,
    defaultCollectionId,
    children,
}) {
    return (
        <ChainRuntimeProvider pluginID={pluginID} defaultChainId={defaultChainId} account={account}>
            <CollectionsProvider defaultCollectionId={defaultCollectionId}>
                <AssetsProvider>{children}</AssetsProvider>
            </CollectionsProvider>
        </ChainRuntimeProvider>
    )
})
