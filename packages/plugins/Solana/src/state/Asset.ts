import type { Web3Pagination } from '@masknet/web3-shared-base'
import { AssetState } from '@masknet/plugin-infra/web3'
import type { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../messages'

export class Asset extends AssetState<ChainId, SchemaType> {
    override async getFungibleAssets(address: string, pagination?: Web3Pagination<ChainId>) {
        return SolanaRPC.getFungibleAssets(address, pagination)
    }

    override async getNonFungibleAssets(address: string, pagination?: Web3Pagination<ChainId>) {
        return SolanaRPC.getNonFungibleAssets(address, pagination)
    }
}
