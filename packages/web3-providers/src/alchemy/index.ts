import { createPageable, HubOptions, NonFungibleToken, Pageable, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { ALCHEMY_API } from '..'
import { fetchJSON } from '../helpers'
import { AlchemyNetworkMap } from './contants'
import type { AlchemyNFT, AlchemyResponse } from './types'

export * from './contants'
export class AlchemyNFTAPI implements ALCHEMY_API.Provider {
    getAssets = async (
        address: string,
        options: HubOptions<ChainId, Record<string, string | undefined>> | undefined,
    ): Promise<Pageable<NonFungibleToken<ChainId, SchemaType>, Record<string, string | undefined>>> => {
        let result: Array<NonFungibleToken<ChainId, SchemaType>> = []
        const api_keys: Record<string, string | undefined> = {}
        Object.keys(AlchemyNetworkMap).forEach((network) => {
            api_keys[network] = ''
        })
        await Promise.all(
            Object.keys(AlchemyNetworkMap).map(async (network, index) => {
                const res = await fetchJSON<AlchemyResponse>(
                    urlcat(`${AlchemyNetworkMap[network].baseURL}${AlchemyNetworkMap[network].API_KEY}/getNFTs/`, {
                        owner: address,
                        pageKey: options?.indicator?.[network] || undefined,
                    }),
                )
                const assets = res?.ownedNfts.map((item: AlchemyNFT) => {
                    const asset = createNFTToken(AlchemyNetworkMap[network].chainId, item)

                    return asset
                })
                api_keys[network] = res?.pageKey

                result = result.concat(assets)

                return network
            }),
        )
        return createPageable(result, { ...options?.indicator }, { ...api_keys })
    }
}

function createNFTToken(chainId: ChainId, asset: AlchemyNFT): NonFungibleToken<ChainId, SchemaType> {
    return {
        id: asset.contract?.address,
        chainId,
        type: TokenType.NonFungible,
        schema: asset?.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155,
        tokenId: Number.parseInt(asset.id?.tokenId.toString(), 16).toString(),
        address: asset.contract?.address,
        metadata: {
            chainId,
            name: asset?.metadata?.name ?? asset?.title,
            symbol: '',
            description: asset.description,
            imageURL: asset?.metadata?.image ?? asset?.media?.[0]?.gateway ?? '',
            mediaURL: asset?.media?.[0]?.gateway,
        },
        contract: {
            chainId,
            schema: asset?.id?.tokenMetadata?.tokenType === 'ERC721' ? SchemaType.ERC721 : SchemaType.ERC1155,
            address: asset?.contract?.address,
            name: asset?.metadata?.name ?? asset?.title,
            symbol: '',
        },
        collection: {
            chainId,
            name: '',
            slug: '',
            description: asset.description,
        },
    }
}
