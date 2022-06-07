import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { AllChainsNonFungibleToken } from '../types'

export function useCollectibles(account: string, pluginId: NetworkPluginID, chainId: ChainId) {
    const {
        value: assets = [],
        error,
        retry,
        done: loading,
    } = useNonFungibleAssets(pluginId, undefined, {
        chainId,
        account,
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
