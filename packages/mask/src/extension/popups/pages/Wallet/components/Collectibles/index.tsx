import { CollectionList, UserAssetsProvider } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from '@masknet/web3-hooks-base'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'

export const Collectibles = memo(function Collectibles() {
    const SEARCH_KEY = 'collectionId'
    const gridProps = useMemo(
        () => ({
            columns: 'repeat(auto-fill, minmax(20%, 1fr))',
            gap: '8px',
        }),
        [],
    )
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const [params, setParams] = useSearchParams()

    const navigate = useNavigate()
    const handleItemClick = useCallback(
        (asset: Web3Helper.NonFungibleTokenAll) => {
            const path = urlcat(PopupRoutes.CollectibleDetail, {
                chainId: asset.chainId,
                address: asset.address,
                id: asset.tokenId,
            })
            navigate(path, { state: { asset } })
        },
        [navigate],
    )
    const handleCollectionChange = useCallback((id: string | undefined) => {
        setParams(
            (params) => {
                if (!id) params.delete(SEARCH_KEY)
                else params.set(SEARCH_KEY, id)
                return params.toString()
            },
            { replace: true },
        )
    }, [])
    return (
        <UserAssetsProvider pluginID={NetworkPluginID.PLUGIN_EVM} address={account}>
            <CollectionList
                pluginID={NetworkPluginID.PLUGIN_EVM}
                account={account}
                gridProps={gridProps}
                disableSidebar
                onItemClick={handleItemClick}
                defaultCollectionId={params.get(SEARCH_KEY) || undefined}
                onCollectionChange={handleCollectionChange}
            />
        </UserAssetsProvider>
    )
})
