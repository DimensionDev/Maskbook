import type { HubOptions, NonFungibleAsset, Pageable } from '@masknet/web3-shared-base'
import type { NonFungibleTokenAPI } from '../../entry-types.js'

import { getNftAsset, getNfts } from '../utils.js'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export class CenterEVM_API implements NonFungibleTokenAPI.Provider<ChainId, SchemaType, string> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        return getNftAsset(address, tokenId, chainId) as unknown as NonFungibleAsset<ChainId, SchemaType>
    }

    async getAssets(from: string, options: HubOptions<ChainId> = {}) {
        return getNfts(from, options) as unknown as Pageable<NonFungibleAsset<ChainId, SchemaType>>
    }
}
