import { Connection } from '@metaplex/js'
import { ChainId } from '@masknet/web3-shared-solana'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { Pageable, Pagination, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { fetchJSON, GetProgramAccountsResponse, requestRPC, SPL_TOKEN_PROGRAM_ID } from './shared'

const ENDPOINT_KEY = 'devnet'

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
    const promises = nftTokens.map(async (x): Promise<Web3Plugin.NonFungibleToken | null> => {
        const metadata = await Metadata.load(connection, x.pubkey)
        if (!metadata) return null
        const externalMeta = await fetchJSON<ExternalMetadata>(metadata.data.data.uri).catch(() => null)
        const pubkey = metadata.pubkey.toBase58()
        return {
            id: pubkey,
            tokenId: pubkey,
            chainId: chainId,
            type: TokenType.NonFungible,
            name: metadata.data.data.name,
            description: externalMeta?.description,
            contract: {
                name: metadata.data.data.name,
                symbol: metadata.data.data.symbol,
                chainId: ChainId.Mainnet,
                address: pubkey,
            },
            metadata: {
                name: metadata.data.data.name,
                description: metadata.data.data.name,
                mediaType: externalMeta?.properties?.category || 'Unknown',
                iconURL: '',
                assetURL: externalMeta?.animation ?? externalMeta?.image ?? '',
            },
        }
    })
    const allSettled = await Promise.allSettled(promises)
    return allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .filter((value): value is Web3Plugin.NonFungibleToken => value !== null)
}

export async function getNonFungibleAssets(
    address: string,
    pagination: Pagination,
    providerType?: string,
    network?: Web3Plugin.NetworkDescriptor,
): Promise<Pageable<Web3Plugin.NonFungibleToken>> {
    const tokens = await getNftList(ChainId.Mainnet, address)

    return {
        currentPage: 1,
        hasNextPage: false,
        data: tokens,
    }
}
