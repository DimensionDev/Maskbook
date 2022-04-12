import { Connection } from '@metaplex/js'
import { ChainId } from '@masknet/web3-shared-solana'
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

async function getNftList(chainId: ChainId, account: string) {
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
    const promises = nftTokens.map(async (x) => {
        const pda = await Metadata.getPDA(x.account.data.parsed.info.mint)
        const metadata = await Metadata.load(connection, pda)
        if (!metadata) return null
        const externalMeta = await fetchJSON<ExternalMetadata>(metadata.data.data.uri).catch(() => null)
        const pubkey = pda.toBase58()
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
                tokenId: pubkey,
            },
            metadata: {
                name: metadata.data.data.name,
                description: metadata.data.data.name,
                mediaType: externalMeta?.properties?.category || 'Unknown',
                iconURL: '',
                assetURL: externalMeta?.animation ?? externalMeta?.image ?? '',
            },
        } as Web3Plugin.NonFungibleToken
    })

    const allSettled = await Promise.allSettled(promises)
    const tokens = allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .filter(Boolean) as Web3Plugin.NonFungibleToken[]
    return tokens
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
