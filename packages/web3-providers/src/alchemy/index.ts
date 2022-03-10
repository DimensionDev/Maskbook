import type { NonFungibleTokenAPI } from '../types'
import urlcat from 'urlcat'
import { ALCHEMY_URL_MAPPINGS } from './constants'
import type { AlchemyNFTItemResponse, AlchemyNFTItemDetailedResponse, AlchemyNFTItemMetadataResponse } from './types'
import { Web3Plugin, PluginId } from '@masknet/plugin-infra'
import { ERC721TokenDetailed, Web3TokenType } from '@masknet/web3-shared-base'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'

interface Payload {
    ownerAddress: string
    nfts: AlchemyNFTItemDetailedResponse[]
    total?: number
    pageKey?: string
}

interface RawPayload {
    ownerAddress: string
    nfts: AlchemyNFTItemMetadataResponse[]
    nftcount: number
}

async function fetchFromAlchemyFlow(path: string, network: Web3Plugin.NetworkDescriptor): Promise<Payload> {
    const alchemyUrl = ALCHEMY_URL_MAPPINGS[network.ID]
    if (!alchemyUrl) return {} as Promise<Payload>
    const response = await fetch(urlcat(alchemyUrl, path))
    const rawData = (await response.json()) as RawPayload
    const nfts: AlchemyNFTItemDetailedResponse[] = rawData.nfts.map((x) => {
        const uri =
            typeof x.media?.[0]?.uri === 'string'
                ? x.media?.[0]?.uri
                : x.media?.[0]?.uri?.raw || x.media?.[0]?.uri?.gateway

        const tokenUri = x.tokenUri?.raw || x.tokenUri?.gateway
        return { ...x, media: { uri }, tokenUri }
    })

    return { ownerAddress: rawData.ownerAddress, nfts, total: rawData.nftcount }
}

async function fetchFromAlchemyEVM(path: string, network: Web3Plugin.NetworkDescriptor, owner: string) {
    const alchemyUrl = ALCHEMY_URL_MAPPINGS[network.ID]
    if (!alchemyUrl) return {} as Promise<Payload>
    const response = await fetch(urlcat(alchemyUrl, path))
    const resultWithNoDetailed = (await response.json()) as {
        ownedNfts: AlchemyNFTItemResponse[]
        pageKey: string
        totalCount: number
    }

    return {
        ownerAddress: owner,
        nfts: resultWithNoDetailed.ownedNfts.map(
            (nft) =>
                ({
                    contract: {
                        address: nft.contract.address,
                        name: nft.title,
                    },
                    id: {
                        tokenId: nft.id.tokenId,
                    },
                    title: nft.title,
                    description: nft.description,
                    media: {
                        uri: nft.metadata.animation_url,
                    },
                    tokenUri: nft.tokenUri.raw,
                } as AlchemyNFTItemDetailedResponse),
        ),
        total: resultWithNoDetailed.totalCount,
        pageKey: resultWithNoDetailed.pageKey || '',
    } as Payload
}

export function toHttpImage(_url?: string) {
    if (!_url) return ''
    const url = _url.replace('ipfs://https://', 'https://').replace('ipfs://http://', 'http://')
    if (url.startsWith?.('ipfs://')) return resolveIPFSLink(url.replace(/^ipfs:\/\//g, ''))
    return url
}

function createNFT(token: AlchemyNFTItemDetailedResponse, owner: string, chainId: number): ERC721TokenDetailed {
    return {
        tokenId: token.id.tokenId,
        info: {
            name: token.title,
            description: token.description,
            tokenURI: token.tokenUri,
            mediaUrl: toHttpImage(token.media.uri),
            imageURL: toHttpImage(token.media.uri),
            owner,
            hasTokenDetailed: true,
        },
        contractDetailed: {
            type: Web3TokenType.ERC721,
            address: token.contract.address,
            chainId,
            name: token.contract.name,
            symbol: token.contract.name,
        },
    }
}

export class AlchemyAPI implements NonFungibleTokenAPI.Provider {
    async getTokens(
        from: string,
        { page = 0, pageSize = 100, pageKey = '' }: NonFungibleTokenAPI.Options,
        network: Web3Plugin.NetworkDescriptor,
    ) {
        const requestPath =
            `${PluginId.Flow}_flow` === network.ID
                ? urlcat('/getNFTs/', {
                      owner: from,
                      pageKey: pageKey || undefined,
                  })
                : urlcat('/v1/getNFTs/', {
                      owner: from,
                      offset: page * pageSize,
                      limit: pageSize,
                  })

        const result =
            `${PluginId.Flow}_flow` === network.ID
                ? await fetchFromAlchemyFlow(requestPath, network)
                : await fetchFromAlchemyEVM(requestPath, network, from)
        if (!result.nfts)
            return {
                data: [],
                hasNextPage: false,
            }

        const data = result.nfts.map((nft) => createNFT(nft, result.ownerAddress, network.chainId))
        return {
            data,
            hasNextPage: data.length === pageSize || Boolean(pageKey),
            pageKey,
            total: result.total,
        }
    }
}

export function getAlchemyNFTList(
    address: string,
    network: Web3Plugin.NetworkDescriptor,
    page?: number,
    pageSize?: number,
    pageKey?: string,
) {
    const alchemy = new AlchemyAPI()
    return alchemy.getTokens(address, { page, pageSize, pageKey }, network)
}
