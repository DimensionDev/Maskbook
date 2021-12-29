import type { NonFungibleTokenAPI } from '../types'
import urlcat from 'urlcat'
import { ALCHEMY_URL } from './constants'
import type { AlchemyNFTItemResponse } from './types'
import { TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'

async function fetchFromAlchemy<T>(path: string) {
    const response = await fetch(urlcat(ALCHEMY_URL, path))
    return response.json() as Promise<T>
}

export function toHttpImage(url?: string) {
    if (!url) return ''
    if (url.startsWith('ipfs://')) return resolveIPFSLink(url.replace(/^ipfs:\/\//g, ''))
    return url
}

function createFlowNFT(token: AlchemyNFTItemResponse, owner: string): Web3Plugin.NonFungibleToken {
    return {
        id: `${token.contract.address}_${token.id.tokenId}`,
        chainId: 1,
        type: TokenType.NonFungible,
        tokenId: token.id.tokenId,
        name: token.title,
        description: token.description,
        owner: owner,
        metadata: {
            name: token.title,
            description: token.description,
            mediaType: token.media.mimeType,
            iconURL: toHttpImage(token.media.uri),
            assetURL: toHttpImage(token.media.uri),
        },
        contract: {
            name: token.contract.name,
            symbol: token.contract.name,
            iconURL: token.contract.externalDomain,
            address: token.contract.address,
            chainId: 1,
        },
    }
}

export class AlchemyAPI implements NonFungibleTokenAPI.Provider {
    async getTokens(from: string, { page = 0, size = 50 }: NonFungibleTokenAPI.Options) {
        const requestPath = urlcat('/v1/getNFTs/', {
            owner: from,
            offset: page * size,
            limit: size,
        })

        interface Payload {
            ownerAddress: string
            nfts: AlchemyNFTItemResponse[]
        }

        const result = await fetchFromAlchemy<Payload>(requestPath)
        if (!result.nfts)
            return {
                data: [],
                hasNextPage: false,
            }

        const data = result.nfts.map((nft) => createFlowNFT(nft, result.ownerAddress))
        return {
            data,
            hasNextPage: data.length === size,
        }
    }
}

export function getAlchemyFlowNFTList(address: string, page?: number, size?: number) {
    const alchemy = new AlchemyAPI()
    return alchemy.getTokens(address, { page, size })
}
