import urlcat from 'urlcat'
import { createIndicator, createPageable, type HubOptions, SourceType, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { RSS3_LEGACY_ENDPOINT } from '../constants.js'
import { fetchJSON } from '../../entry-helpers.js'
import { type NonFungibleTokenAPI, RSS3BaseAPI } from '../../entry-types.js'

export class RSS3NonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAssets(address: string, { chainId, indicator, size = 50 }: HubOptions<ChainId> = {}) {
        if (chainId !== ChainId.Mainnet && chainId !== ChainId.Matic)
            return createPageable([], createIndicator(indicator))

        const url = urlcat(RSS3_LEGACY_ENDPOINT, '/assets/list', {
            personaID: address,
            type: RSS3BaseAPI.AssetType.NFT,
        })

        const { status, assets = [] } = await fetchJSON<RSS3BaseAPI.GeneralAssetResponse>(url)
        if (!status) return createPageable([], createIndicator(indicator))

        const data = assets
            .filter((x) => ['Ethereum-NFT', 'Polygon-NFT'].includes(x.type))
            .map((asset) => {
                const [address, tokenId] = asset.id.split('-')
                const chainId = asset.type === 'Ethereum-NFT' ? ChainId.Mainnet : ChainId.Matic
                return {
                    id: asset.id,
                    type: TokenType.NonFungible,
                    schema: SchemaType.ERC721,
                    chainId,
                    address,
                    tokenId,
                    collection: {
                        chainId,
                        name: asset.info.collection ?? '',
                        slug: '',
                    },
                    source: SourceType.RSS3,
                }
            })
            .filter((x) => x.chainId === chainId)
        return createPageable(data, createIndicator(indicator))
    }
}
