// cspell:ignore metaplex
import { Connection } from '@metaplex/js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { EMPTY_LIST, createIndicator, createPageable, type Pageable } from '@masknet/shared-base'
import { type NonFungibleAsset, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import type { GetProgramAccountsResponse, SolanaHubOptions } from '../types/index.js'
import { requestRPC } from '../helpers/index.js'
import { fetchJSON } from '../../../helpers/fetchJSON.js'
import { getAssetFullName } from '../../../helpers/getAssetFullName.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'

interface ExternalMetadata {
    name: string
    symbol: string
    description: string
    image?: string
    animation?: string
    properties: {
        files: Array<{
            uri: string
            type: LiteralUnion<'image/jpeg', 'image/png'>
        }>
        category: string
        creators: Array<{
            address: string
            share: 100
        }>
    }
}

async function getNonFungibleAssets(
    chainId: ChainId,
    account: string,
): Promise<Array<NonFungibleAsset<ChainId, SchemaType>>> {
    const data = await requestRPC<GetProgramAccountsResponse>(chainId, {
        method: 'getProgramAccounts',
        params: [
            'https://api.raydium.io/v2/sdk/token/raydium.mainnet.json',
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
    if (!data.result?.length) return EMPTY_LIST
    const connection = new Connection('mainnet-beta')
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
                name: getAssetFullName(pubkey, metadata.data.data.name, metadata.data.data.name),
                symbol: metadata.data.data.symbol,
                description: externalMeta?.description,
                mediaURL: externalMeta?.animation ?? externalMeta?.image ?? '',
                mediaType: externalMeta?.properties.category || 'Unknown',
            },
        }
    })

    const allSettled = await Promise.allSettled(promises)
    return allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value ?? [] : []))
}

class SolanaNonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAssets(
        address: string,
        options?: SolanaHubOptions,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const tokens = await getNonFungibleAssets(options?.chainId ?? ChainId.Mainnet, address)

        return createPageable(tokens, createIndicator(options?.indicator))
    }
}
export const SolanaNonFungible = new SolanaNonFungibleTokenAPI()
