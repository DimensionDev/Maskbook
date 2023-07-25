import { EMPTY_LIST } from '@masknet/shared-base'
import { useAccount, useBlockedNonFungibleTokens } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { memo, useMemo, type PropsWithChildren } from 'react'
import { AssetsProvider } from './AssetsProvider.js'
import { ChainRuntimeProvider, type ChainRuntimeProviderProps } from './ChainRuntimeProvider.js'
import { CollectionsProvider, type CollectionsProviderProps } from './CollectionsProvider.js'

interface UserAssetsProviderProps extends ChainRuntimeProviderProps, CollectionsProviderProps {}

export const UserAssetsProvider = memo<PropsWithChildren<UserAssetsProviderProps>>(function UserAssetsProvider({
    pluginID,
    account,
    defaultChainId,
    defaultCollectionId,
    children,
}) {
    const systemAccount = useAccount()

    const blockedTokens = useBlockedNonFungibleTokens(pluginID)
    const blockedIds = useMemo(() => {
        if (isSameAddress(systemAccount, account)) return EMPTY_LIST
        return blockedTokens.map((x) => x.id)
    }, [blockedTokens, systemAccount, account])

    return (
        <ChainRuntimeProvider pluginID={pluginID} defaultChainId={defaultChainId} account={account}>
            <CollectionsProvider defaultCollectionId={defaultCollectionId}>
                <AssetsProvider blockedIds={blockedIds}>{children}</AssetsProvider>
            </CollectionsProvider>
        </ChainRuntimeProvider>
    )
})
