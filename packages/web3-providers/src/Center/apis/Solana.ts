import type { HubOptions, NonFungibleAsset, Pageable } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import type { NonFungibleTokenAPI } from '../../entry-types.js'
import { getNftAsset, getNfts } from '../utils.js'

export class CenterSolana_API implements NonFungibleTokenAPI.Provider<ChainId, SchemaType, string> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const asset = getNftAsset(address, tokenId, chainId)
        return asset as unknown as NonFungibleAsset<ChainId, SchemaType>
    }
    async getAssets(from: string, options: HubOptions<ChainId> = {}) {
        return getNfts(from, options) as unknown as Pageable<NonFungibleAsset<ChainId, SchemaType>>
    }
}
