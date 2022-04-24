import type { Web3Plugin, Pageable, Pagination } from '../web3-types'

async function* getPagableItemsAsIterator<ChainId extends number, Item>(
    chainId: ChainId,
    address: string,
    getItems?: (chainId: ChainId, address: string, pagination: Pagination) => Promise<Pageable<Item>>,
    options: {
        /** The number of start page. */
        startAt?: number
        /** The number of end page. */
        endAt?: number
        /** The size of each page. */
        size?: number
    } = {},
): AsyncIterableIterator<Item> {
    if (!getItems) {
        yield* []
        return
    }

    const { startAt = 0, endAt = 10, size = 50 } = options
    let page = startAt

    while (page < endAt) {
        const result = await getItems(chainId, address, {
            page,
            size,
        })

        yield* result.data

        if (result.hasNextPage) page += 1
        else return
    }
}

export class AssetState<ChainId, SchemaType> implements Web3Plugin.ObjectCapabilities.AssetState<ChainId, SchemaType> {}
