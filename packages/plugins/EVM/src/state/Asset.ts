import { OpenSea, NFTScan, DeBank, Zerion } from '@masknet/web3-providers'
import { createPageable, Web3Pagination } from '@masknet/web3-shared-base'
import { AssetState } from '@masknet/plugin-infra/web3'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export class Asset extends AssetState<ChainId, SchemaType> {
    override async getFungibleAssets(address: string, pagination?: Web3Pagination<ChainId>) {
        // only the first page is available
        if ((pagination?.page ?? 0) > 0) return createPageable([])
        try {
            return DeBank.getAssets(address, pagination)
        } catch {
            return Zerion.getAssets(address, pagination)
        }
    }

    override async getNonFungibleAssets(address: string, pagination?: Web3Pagination<ChainId>) {
        try {
            return OpenSea.getTokens(address, pagination)
        } catch {
            return NFTScan.getTokens(address, pagination)
        }
    }
}
