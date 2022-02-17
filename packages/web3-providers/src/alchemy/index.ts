import type { NonFungibleTokenAPI } from '../types'
import urlcat from 'urlcat'
import { ALCHEMY_URL_MAPPINGS } from './constants'
import type { AlchemyNFTItemResponse, AlchemyNFTItemDetailedResponse, AlchemyNFTItemMetadataResponse } from './types'
import { Web3Plugin, PluginId, ERC721TokenDetailed, EthereumTokenType } from '@masknet/plugin-infra'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'

interface Payload {
    ownerAddress: string
    nfts: AlchemyNFTItemDetailedResponse[]
}

async function fetchFromAlchemyFlow(path: string, network: Web3Plugin.NetworkDescriptor) {
    const alchemyUrl = ALCHEMY_URL_MAPPINGS[network.ID]
    if (!alchemyUrl) return {} as Promise<Payload>
    const response = await fetch(urlcat(alchemyUrl, path))
    return response.json() as Promise<Payload>
}

async function fetchFromAlchemyEVM(path: string, network: Web3Plugin.NetworkDescriptor, owner: string) {
    const alchemyUrl = ALCHEMY_URL_MAPPINGS[network.ID]
    if (!alchemyUrl) return {} as Promise<Payload>
    const response = await fetch(urlcat(alchemyUrl, path))
    const resultWithNoDetailed = (await response.json()) as {
        ownedNfts: AlchemyNFTItemResponse[]
    }
    const allRequest = resultWithNoDetailed.ownedNfts.map(async (t) => {
        const requestPath = urlcat('/v1/getNFTMetadata/', {
            contractAddress: t.contract.address,
            tokenId: t.id.tokenId,
            tokenType: 'ERC721',
        })
        const response = await fetch(urlcat(alchemyUrl, requestPath))
        const tokenMetaData = (await response.json()) as AlchemyNFTItemMetadataResponse
        console.log({ tokenMetaData: JSON.stringify(tokenMetaData) })
        return {
            contract: {
                name: tokenMetaData.metadata.name,
                address: tokenMetaData.contract.address,
                externalDomain: tokenMetaData.externalDomainViewUrl,
            },
            id: { tokenId: tokenMetaData.id.tokenId },
            title: tokenMetaData.title,
            description: tokenMetaData.description,
            media: {
                uri:
                    tokenMetaData.metadata.image ||
                    (typeof tokenMetaData.media?.[0]?.uri === 'string'
                        ? tokenMetaData.media?.[0]?.uri
                        : tokenMetaData.media?.[0]?.uri?.raw || tokenMetaData.media?.[0]?.uri?.gateway),
                mimeType: '',
            },
            tokenUri: tokenMetaData.tokenUri?.raw || tokenMetaData.tokenUri?.gateway,
        } as AlchemyNFTItemDetailedResponse
    })

    const nfts = (await Promise.allSettled(allRequest))
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => Boolean(v)) as AlchemyNFTItemDetailedResponse[]
    console.log({ nfts: JSON.stringify(nfts) })
    return {
        ownerAddress: owner,
        nfts,
    } as Payload
}

export function toHttpImage(url?: string) {
    if (!url) return ''
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
            type: EthereumTokenType.ERC721,
            address: token.contract.address,
            chainId,
            name: token.contract.name,
            symbol: token.contract.name,
            iconURL: token.contract.externalDomain,
        },
    }
}

export class AlchemyAPI implements NonFungibleTokenAPI.Provider {
    async getTokens(
        from: string,
        { page = 0, size = 50 }: NonFungibleTokenAPI.Options,
        network: Web3Plugin.NetworkDescriptor,
    ) {
        const requestPath = urlcat('/v1/getNFTs/', {
            owner: from,
            offset: page * size,
            limit: size,
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
            hasNextPage: page === 0,
        }
    }
}

export function getAlchemyNFTList(
    address: string,
    network: Web3Plugin.NetworkDescriptor,
    page?: number,
    size?: number,
) {
    const alchemy = new AlchemyAPI()
    return alchemy.getTokens(address, { page, size }, network)
}
