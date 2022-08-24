import {
    HubOptions,
    HubIndicator,
    FungibleAsset,
    Pageable,
    TokenType,
    createPageable,
    createIndicator,
    FungibleToken,
    isSameAddress,
    CurrencyType,
    NonFungibleToken,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, createNativeToken } from '@masknet/web3-shared-solana'
import { memoizePromise } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { FungibleTokenAPI, TokenListBaseAPI } from '../../types'
import { RAYDIUM_TOKEN_LIST, SPL_TOKEN_PROGRAM_ID } from '../constants'
import { createFungibleAsset, createFungibleToken, requestRPC } from '../helpers'
import type { GetAccountInfoResponse, GetProgramAccountsResponse, RaydiumTokenList } from '../types'
import { CoinGeckoAPI } from '../../coingecko'

const fetchTokenList = memoizePromise(
    async (url: string): Promise<Array<FungibleToken<ChainId, SchemaType>>> => {
        const response = await fetch(url, { cache: 'force-cache' })
        const tokenList = (await response.json()) as RaydiumTokenList
        const tokens: Array<FungibleToken<ChainId, SchemaType>> = [...tokenList.official, ...tokenList.unOfficial].map(
            (token) => {
                if (isSameAddress(token.mint, '11111111111111111111111111111111'))
                    return createNativeToken(ChainId.Mainnet)
                return {
                    id: token.mint,
                    chainId: ChainId.Mainnet,
                    type: TokenType.Fungible,
                    schema: SchemaType.Fungible,
                    address: token.mint,
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    logoURL: token.icon,
                }
            },
        )
        return tokens
    },
    (url) => url,
)

export class SolanaFungibleAPI
    implements TokenListBaseAPI.Provider<ChainId, SchemaType>, FungibleTokenAPI.Provider<ChainId, SchemaType>
{
    coingecko = new CoinGeckoAPI()

    private async getSplTokenList(chainId: ChainId, account: string) {
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
        const tokenList = await this.getFungibleTokens(chainId, [])
        const splTokens: Array<FungibleAsset<ChainId, SchemaType>> = []
        data.result.forEach((x) => {
            const info = x.account.data.parsed.info
            const token = tokenList.find((y) => y.address === info.mint)
            const isSafe = info.tokenAmount.decimals !== 0 && token !== undefined
            if (!isSafe) return
            const name = token.name || 'Unknown Token'
            const symbol = token.symbol || 'Unknown Token'
            const splToken = createFungibleAsset(
                createFungibleToken(chainId, info.mint, name, symbol, info.tokenAmount.decimals, token.logoURL),
                info.tokenAmount.amount,
            )
            splTokens.push(splToken)
        })
        return splTokens
    }

    async getAsset(account: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {}) {
        const priceData = await this.coingecko.getTokensPrice(['solana'])
        const price = priceData.solana

        const data = await requestRPC<GetAccountInfoResponse>(chainId, {
            method: 'getAccountInfo',
            params: [account],
        })
        const balance = data.result?.value.lamports.toString() ?? '0'
        return createFungibleAsset(createNativeToken(chainId), balance, {
            [CurrencyType.USD]: price.toString(),
        })
    }

    async getAssets(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, HubIndicator>> {
        const allSettled = await Promise.allSettled([
            this.getAsset(address, { chainId }).then((x) => [x]),
            this.getSplTokenList(chainId, address),
        ])
        const assets = allSettled
            .map((x) => (x.status === 'fulfilled' ? x.value : null))
            .flat()
            .filter(Boolean)

        return createPageable(assets as Array<FungibleAsset<ChainId, SchemaType>>, createIndicator(indicator))
    }

    async getFungibleTokens(chainId: ChainId, urls: string[]): Promise<FungibleToken<ChainId, SchemaType>[]> {
        if (chainId !== ChainId.Mainnet) return EMPTY_LIST
        return fetchTokenList(RAYDIUM_TOKEN_LIST)
    }

    async getNonFungibleTokens(chainId: ChainId, urls: string[]): Promise<NonFungibleToken<ChainId, SchemaType>[]> {
        return EMPTY_LIST
    }
}
