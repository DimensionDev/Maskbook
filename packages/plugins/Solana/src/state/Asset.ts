import type { Pagination, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../messages'

export class Asset implements Web3Plugin.ObjectCapabilities.AssetState<ChainId> {
    async getFungibleAssets(chainId: ChainId, address: string, pagination?: Pagination) {
        return SolanaRPC.getFungibleAssets(chainId, address, pagination)
    }

    async getNonFungibleAssets(chainId: ChainId, address: string, pagination?: Pagination) {
        return SolanaRPC.getNonFungibleAssets(chainId, address, pagination)
    }
}
