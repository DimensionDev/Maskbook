import type { Pagination, Web3Plugin } from '@masknet/plugin-infra/web3'
import { OpenSea, NFTScan, DeBank, Zerion } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'

export class Asset implements Web3Plugin.ObjectCapabilities.AssetState<ChainId> {
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

    async *getAllFungibleAssets(chainId: ChainId, address: string) {
        // todo: use cache
        const result = this.getFungibleAssets(chainId, address)
        yield result
    }

    async *getAllNonFungibleAssets(chainId: ChainId, address: string) {
        let currentPage = 0
        let haveNextPage = true

        while (haveNextPage) {
            const result = await this.getNonFungibleAssets(chainId, address, { page: currentPage, size: 50 })
            yield result.data
            haveNextPage = result.hasNextPage
            currentPage = currentPage + 1
        }
    }
}
