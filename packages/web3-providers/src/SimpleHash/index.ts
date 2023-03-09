import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '../entry-types.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { type HubOptions, createPageable, type NonFungibleAsset, createIndicator } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import { fetchFromSimpleHash, createNonFungibleAsset, resolveChain } from './helpers.js'

import { type Asset } from './type.js'

export class SimpleHashProviderAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const chain = resolveChain(chainId)
        if (!chain || !address || !tokenId || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        })
        const response = await fetchFromSimpleHash<Asset>(path)
        return createNonFungibleAsset(response)
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {}) {
        const chain = resolveChain(chainId)
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: '',
        })

        const response = await fetchFromSimpleHash<Asset[]>(path)
        const assets = response.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(assets, indicator)
    }
}
