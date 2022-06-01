import { Connection } from '@metaplex/js'
import { HubOptions, NonFungibleAsset, NonFungibleToken, Pageable, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
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

async function getNftList(chainId: ChainId, account: string): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
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
                            bytes: 'CZN1CMu9tWmuG2kW5eiG2ucheVnGqSBLKuMtrtBCQnw1',
                        },
                    },
                ],
            },
        ],
    })
    if (!data.result?.length) return []
    const connection = new Connection(ENDPOINT_KEY)
    const nftTokens = data.result.filter((x) => x.account.data.parsed.info.tokenAmount.decimals === 0)
    const promises = nftTokens.map(async (x): Promise<NonFungibleAsset<ChainId, SchemaType> | null> => {
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
            schema: SchemaType.NonFungible,
            address: '',
            contract: {
                chainId,
                name: metadata.data.data.name,
                symbol: metadata.data.data.symbol,
                address: pubkey,
                schema: SchemaType.NonFungible,
            },
            metadata: {
                chainId,
                name: metadata.data.data.name,
                symbol: metadata.data.data.symbol,
                description: externalMeta?.description,
                mediaURL: externalMeta?.animation ?? externalMeta?.image ?? '',
                mediaType: externalMeta?.properties?.category || 'Unknown',
            },
        }
    })

    const allSettled = await Promise.allSettled(promises)
    const assets = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)).filter(Boolean)
    return assets as Array<NonFungibleAsset<ChainId, SchemaType>>
}

export async function getNonFungibleAssets(
    address: string,
    options?: HubOptions<ChainId>,
): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
    const tokens = await getNftList(options?.chainId ?? ChainId.Mainnet, address)

    return {
        currentPage: 0,
        hasNextPage: false,
        data: tokens,
    }
}
