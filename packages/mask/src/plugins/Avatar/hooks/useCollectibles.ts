import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { AllChainsNonFungibleToken } from '../types'

export function useCollectibles(account: string, pluginId: NetworkPluginID, chainId: ChainId) {
    const {
        value: assets = [],
        error,
        retry,
        loading,
    } = useNonFungibleAssets(pluginId, undefined, {
        chainId,
        // account,
        account: pluginId === NetworkPluginID.PLUGIN_SOLANA ? '2qZeMst5bcSjNQJKbdNAczEw5XJ8UHvYD2uW6kSWvVde' : account,
        // account: '2qZeMst5bcSjNQJKbdNAczEw5XJ8UHvYD2uW6kSWvVde',
    })

    const collectibles = assets.map((x) => {
        return {
            contract: x.contract,
            metadata: x.metadata,
            collection: x.collection,
            tokenId: x.tokenId,
        } as AllChainsNonFungibleToken
    })
    return { collectibles, error, retry, loading }
}
