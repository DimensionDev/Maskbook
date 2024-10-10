import { memoize, uniqBy } from 'lodash-es'
import { memoizePromise } from '@masknet/kit'
import { type PageIndicator, type Pageable, createPageable, createIndicator, EMPTY_LIST } from '@masknet/shared-base'
import {
    type FungibleAsset,
    TokenType,
    type FungibleToken,
    isSameAddress,
    CurrencyType,
    type NonFungibleToken,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    SchemaType,
    isValidChainId,
    getTokenListConstants,
    getNativeTokenAddress,
    getTokenConstant,
} from '@masknet/web3-shared-solana'
import { SolanaChainResolver } from './ResolverAPI.js'
import * as CoinGeckoPriceSolana from /* webpackDefer: true */ '../../../CoinGecko/index.js'
import { RAYDIUM_TOKEN_LIST, SPL_TOKEN_PROGRAM_ID } from '../constants/index.js'
import { createFungibleAsset, createFungibleToken, requestRPC } from '../helpers/index.js'
import type {
    GetBalanceResponse,
    GetProgramAccountsResponse,
    RaydiumTokenList,
    MaskToken,
    SolanaHubOptions,
} from '../types/index.js'
import { fetchJSON } from '../../../helpers/fetchJSON.js'
import type { FungibleTokenAPI, TokenListAPI } from '../../../entry-types.js'

const fetchRaydiumTokenList = memoizePromise(
    memoize,
    async (url: string): Promise<Array<FungibleToken<ChainId, SchemaType>>> => {
        const tokenList = await fetchJSON<RaydiumTokenList>(url, { cache: 'force-cache' })
        const tokens: Array<FungibleToken<ChainId, SchemaType>> = [...tokenList.official, ...tokenList.unOfficial].map(
            (token) => {
                if (isSameAddress(token.mint, '11111111111111111111111111111111'))
                    return SolanaChainResolver.nativeCurrency(ChainId.Mainnet)
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

const fetchMaskTokenList = memoizePromise(
    memoize,
    async (url: string): Promise<Array<FungibleToken<ChainId, SchemaType>>> => {
        const res = await fetchJSON<{ tokens: MaskToken[] }>(url, { cache: 'force-cache' })
        const nativeAddress = getTokenConstant(ChainId.Mainnet, 'SOL_ADDRESS', '')
        const tokens: Array<FungibleToken<ChainId, SchemaType>> = res.tokens.map((token) => {
            if (isSameAddress(token.address, nativeAddress)) return SolanaChainResolver.nativeCurrency(ChainId.Mainnet)

            return {
                id: token.address,
                chainId: ChainId.Mainnet,
                type: TokenType.Fungible,
                schema: SchemaType.Fungible,
                address: token.address,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                logoURL: token.originLogoURI || token.logoURI,
            }
        })
        return tokens
    },
    (url) => url,
)

class SolanaFungibleTokenAPI
    implements TokenListAPI.Provider<ChainId, SchemaType>, FungibleTokenAPI.Provider<ChainId, SchemaType>
{
    private async getSplTokenList(chainId: ChainId, account: string) {
        if (!isValidChainId(chainId)) return []
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
        const tokenList = await this.getFungibleTokenList(chainId, [])
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

    async getAsset(account: string, { chainId = ChainId.Mainnet }: SolanaHubOptions = {}) {
        const price = await CoinGeckoPriceSolana.CoinGeckoPriceSolana.getFungibleTokenPrice(
            chainId,
            getNativeTokenAddress(),
            {
                currencyType: CurrencyType.USD,
            },
        )

        const data = await requestRPC<GetBalanceResponse>(chainId, {
            method: 'getBalance',
            params: [account],
        })
        const balance = data.result?.value.toString() ?? '0'
        return createFungibleAsset(SolanaChainResolver.nativeCurrency(chainId), balance, {
            [CurrencyType.USD]: price?.toString(),
        })
    }

    async getAssets(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: SolanaHubOptions = {},
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, PageIndicator>> {
        if (!isValidChainId(chainId)) {
            return createPageable([], createIndicator(indicator))
        }
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

    async getFungibleTokenList(chainId: ChainId, urls?: string[]): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        if (chainId !== ChainId.Mainnet) return EMPTY_LIST
        const { FUNGIBLE_TOKEN_LISTS = EMPTY_LIST } = getTokenListConstants(chainId)
        const maskTokenList = await fetchMaskTokenList(FUNGIBLE_TOKEN_LISTS[0])
        const raydiumTokenList = await fetchRaydiumTokenList(RAYDIUM_TOKEN_LIST)

        return uniqBy([...maskTokenList, ...raydiumTokenList], (x) => x.address).filter((x) => x.name && x.symbol)
    }

    async getNonFungibleTokenList(
        chainId: ChainId,
        urls?: string[],
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        return EMPTY_LIST
    }
}
export const SolanaFungible = new SolanaFungibleTokenAPI()
