import type {
    Pageable,
    Pagination,
    AssetState as Web3AssetState,
    FungibleAsset,
    NonFungibleAsset,
} from '@masknet/web3-shared-base'

const PAGE_SIZE = 50
const MAX_PAGE_SIZE = 25

export class AssetState<ChainId, SchemaType> implements Web3AssetState<ChainId, SchemaType> {
    getFungibleAssets(
        address: string,
        pagination?: Pagination | undefined,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleAssets(
        address: string,
        pagination?: Pagination | undefined,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async *getAllFungibleAssets(address: string): AsyncIterableIterator<FungibleAsset<ChainId, SchemaType>> {
        for (let i = 0; i < MAX_PAGE_SIZE; i += 1) {
            const pageable = await this.getFungibleAssets(address, {
                page: i,
                size: PAGE_SIZE,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }

    async *getAllNonFungibleAssets(address: string): AsyncIterableIterator<NonFungibleAsset<ChainId, SchemaType>> {
        for (let i = 0; i < MAX_PAGE_SIZE; i += 1) {
            const pageable = await this.getNonFungibleAssets(address, {
                page: i,
                size: PAGE_SIZE,
            })

            yield* pageable.data

            if (pageable.data.length === 0) return
        }
    }
}
