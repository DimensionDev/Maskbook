import { Connection } from '@metaplex/js'
import type { ChainId } from '@masknet/web3-shared-solana'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { Pageable, Pagination, TokenType, Web3Plugin } from '@masknet/plugin-infra/web3'
import { fetchJSON, GetProgramAccountsResponse, requestRPC, SPL_TOKEN_PROGRAM_ID } from './shared'
import { ENDPOINT_KEY } from '../constants'

interface ExternalMetadata {
    name: string
    symbol: string
    description: string
    image?: string
    animation?: string
    properties: {
        files: Array<{
            uri: string
            type: 'image/jpeg' | string
        }>
        category: string
        creators: Array<{
            address: string
            share: 100
        }>
    }
}

async function getNftList(chainId: ChainId, account: string): Promise<Web3Plugin.NonFungibleToken[]> {
    const data = await requestRPC<GetProgramAccountsResponse>(chainId, {
        method: 'getProgramAccounts',
        params: [
            SPL_TOKEN_PROGRAM_ID,
            {
                encoding: 'jsonParsed',
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: account,
                        },
                    },
                ],
            },
        ],
    })
    if (!data.result?.length) return []
    const connection = new Connection(ENDPOINT_KEY)
    const nftTokens = data.result.filter((x) => x.account.data.parsed.info.tokenAmount.decimals === 0)
    const promises = nftTokens.map(async (x): Promise<Web3Plugin.NonFungibleAsset | null> => {
        const pda = await Metadata.getPDA(x.account.data.parsed.info.mint)
        const metadata = await Metadata.load(connection, pda)
        if (!metadata) return null
        const externalMeta = await fetchJSON<ExternalMetadata>(metadata.data.data.uri).catch(() => null)
        const pubkey = pda.toBase58()
        return {
            id: pubkey,
            tokenId: pubkey,
            chainId,
            type: TokenType.NonFungible,
            subType: TokenType.NonFungible,
            address: '',
            contract: {
                type: '',
                name: metadata.data.data.name,
                symbol: metadata.data.data.symbol,
                chainId,
                address: pubkey,
            },
            metadata: {
                name: metadata.data.data.name,
                description: externalMeta?.description,
                mediaURL: externalMeta?.animation ?? externalMeta?.image ?? '',
                mediaType: externalMeta?.properties?.category || 'Unknown',
            },
        }
    })

    const allSettled = await Promise.allSettled(promises)
    const assets = await allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)).filter(Boolean)
    return assets as Web3Plugin.NonFungibleAsset[]
}

export async function getNonFungibleAssets(
    chainId: ChainId,
    address: string,
    pagination?: Pagination,
): Promise<Pageable<Web3Plugin.NonFungibleAsset>> {
    const tokens = await getNftList(chainId, address)

    return {
        hasNextPage: false,
        data: tokens,
    }
}
