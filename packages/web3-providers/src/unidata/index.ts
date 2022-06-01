import { createPageable, HubOptions, NonFungibleTokenCollection } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import Unidata from 'unidata.js'
import { UniDataAssetsAPI } from '../types'

const unidata = new Unidata()

export class UNIDATA_API implements UniDataAssetsAPI.Provider {
    async getAssets(
        source: UniDataAssetsAPI.SourceType,
        address: string,
        { page = 0, size = 50 }: HubOptions<ChainId> = {},
    ) {
        const assets: UniDataAssetsAPI.Assets = await unidata.assets.get({
            source,
            identity: address,
        })
        if (!assets) return createPageable<NonFungibleTokenCollection<ChainId>>()

        console.log({ assets })
        const collections: Array<NonFungibleTokenCollection<ChainId>> =
            assets?.list
                ?.map((x) => ({
                    chainId: x?.metadata && UniDataAssetsAPI.NetworkId?.[x.metadata.network],
                    name: x.name,
                    // slug: x.name,
                    address: x?.metadata?.collection_address ?? x?.metadata?.proof ?? '',
                    symbol: x?.metadata?.token_symbol ?? x?.metadata?.collection_name,
                    // schema_name: x.primary_asset_contracts?.[0]?.schema_name,
                    description: x.description,
                    iconURL: x.previews?.[0]?.address,
                    // balance: x.owned_asset_count,
                    // verified: ['approved', 'verified'].includes(x.safelist_request_status ?? ''),
                    // createdAt: getUnixTime(new Date(x.created_date)),
                }))
                .filter((x) => x.address) ?? []
        return createPageable(collections, page, collections.length === size)
    }
}
