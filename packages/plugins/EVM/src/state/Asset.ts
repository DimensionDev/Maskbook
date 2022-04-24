import type { Pagination, Web3Plugin } from '@masknet/plugin-infra/web3'
import { OpenSea, NFTScan, DeBank, Zerion } from '@masknet/web3-providers'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export class Asset implements Web3Plugin.ObjectCapabilities.AssetState<ChainId, SchemaType> {
    async getFungibleAssets(chainId: ChainId, address: string, pagination?: Pagination) {
        try {
            return DeBank.getAssets(chainId, address)
        } catch {
            return Zerion.getAssets(chainId, address)
        }
    }

    async getNonFungibleAssets(chainId: ChainId, address: string, pagination?: Pagination) {
        try {
            return OpenSea.getTokens(address, {
                chainId,
                ...pagination,
            })
        } catch {
            return NFTScan.getTokens(address, {
                chainId,
                ...pagination,
            })
        }
    }
}
