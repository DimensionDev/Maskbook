import type { NonFungibleTokenAPI } from '../entry-types.js'
import { type HubOptions } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { fetchFromSimpleHash, createNonFungibleAsset, resolveChain } from './helpers.js'
import { type Asset } from './type.js'

export class SimpleHashProviderAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const path = `/api/v0/nfts/${resolveChain(chainId)}/${address}/${tokenId}`
        const response = await fetchFromSimpleHash<Asset>(path)
        return createNonFungibleAsset(response)
    }
}
