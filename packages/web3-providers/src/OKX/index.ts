import { queryClient } from '@masknet/shared-base-ui'
import { rightShift, TokenType, type FungibleToken } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { blockedTokenMap, NATIVE_TOKEN_ADDRESS, OKX_HOST } from './constant.js'
import { fixToken, fromOkxNativeAddress, normalizeCode, toOkxNativeAddress } from './helper.js'
import type {
    ApproveTransactionOptions,
    ApproveTransactionResponse,
    BridgeOptions,
    GetBridgeQuoteOptions,
    GetBridgeQuoteResponse,
    GetBridgeResponse,
    GetBridgeStatusOptions,
    GetBridgeStatusResponse,
    GetLiquidityResponse,
    GetQuotesOptions,
    GetQuotesResponse,
    GetTokenPairsResponse,
    GetTokensResponse,
    SupportedChainResponse,
    SwapOptions,
    SwapResponse,
} from './types.js'

/** request okx official API, and normalize the code */
function fetchFromOKX<T extends { code: number }>(input: RequestInfo | URL, init?: RequestInit) {
    if (process.env.NODE_ENV === 'development') {
        if (typeof input === 'string' && input.includes('0x00000')) {
            console.warn('Do you forget to convert to okx native address?', input)
        }
    }
    return fetchJSON<T>(input, init).then(normalizeCode)
}

export class OKX {
    /**
     * @docs https://www.okx.com/web3/build/docs/waas/dex-get-aggregator-supported-chains
     */
    static async getSupportedChains() {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/supported/chain')
        const res = await fetchFromOKX<SupportedChainResponse>(url)
        return res.code === 0 ? res.data : undefined
    }

    static async baseGetTokens(chainId: ChainId, apiRoute: string) {
        if (!chainId) return null
        const url = urlcat(OKX_HOST, apiRoute, {
            chainId,
        })
        const res = await fetchFromOKX<GetTokensResponse>(url)
        if (res.code !== 0) return null
        const tokens = res.data
        return (
            tokens
                // There are some invalid tokens mixed in.
                .filter((x) => {
                    if (!x.tokenContractAddress.startsWith('0x')) return false
                    const blockedList = blockedTokenMap[chainId] || []
                    if (!blockedList.length) return true
                    return !blockedList.includes(x.tokenContractAddress.toLowerCase())
                })
                .map((x) => {
                    return {
                        id: x.tokenContractAddress,
                        chainId,
                        name: x.tokenName,
                        symbol: x.tokenSymbol,
                        // string to number for /api/v5/dex/aggregator/all-tokens
                        decimals: +x.decimals,
                        logoURL: x.tokenLogoUrl,
                        address: fromOkxNativeAddress(x.tokenContractAddress),
                        type: TokenType.Fungible,
                        schema: SchemaType.ERC20,
                    } satisfies FungibleToken<ChainId, SchemaType>
                })
        )
    }

    static async getTokens(chainId: ChainId): Promise<Array<FungibleToken<ChainId, SchemaType>> | null> {
        return OKX.baseGetTokens(chainId, '/api/v5/dex/aggregator/all-tokens')
    }

    static async getBridgeTokens(chainId: ChainId) {
        return OKX.baseGetTokens(chainId, '/api/v5/dex/cross-chain/supported/tokens')
    }

    static async getBridgeTokenPairs(fromChainId: ChainId) {
        if (!fromChainId) return []
        const url = urlcat(OKX_HOST, '/api/v5/dex/cross-chain/supported/bridge-tokens-pairs', {
            fromChainId,
        })
        const res = await fetchFromOKX<GetTokenPairsResponse>(url)
        if (res.code !== 0) return
        const tokens = res.data
        return tokens.map((x) => {
            return {
                ...x,
                fromChainId: +x.fromChainId,
                toChainId: +x.toChainId,
            }
        })
    }

    static async getSupportedBridges(chainId: ChainId) {
        if (!chainId) return []
        const url = urlcat(OKX_HOST, '/api/v5/dex/cross-chain/supported/bridges', {
            chainId,
        })
        const res = await fetchFromOKX<GetTokenPairsResponse>(url)
        if (res.code !== 0) return
        const tokens = res.data
        return tokens.map((x) => {
            return {
                ...x,
                fromChainId: +x.fromChainId,
                toChainId: +x.toChainId,
            }
        })
    }

    static async getLiquidity(chainId: string) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/get-liquidity', {
            chainId,
        })
        // cspell: disable-next-line
        // XXX Suspect this is private API of OKX, according to `pri(vate)api`, which provides dex logo
        const privateUrl = urlcat('https://www.okx.com/priapi/v1/dx/trade/multi/liquidityList', { chainId })
        const [res, resWithLogo] = await Promise.all([
            fetchFromOKX<GetLiquidityResponse>(url),
            fetchJSON<GetLiquidityResponse>(privateUrl),
        ])
        const dexLogoMap = new Map(resWithLogo.data.map((x) => [x.id, x.logo]))
        return {
            ...res,
            data: res.data.map((dex) => ({ ...dex, logo: dexLogoMap.get(dex.id) })),
        }
    }

    static async getApproveTx(options: ApproveTransactionOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/approve-transaction', options)
        const res = await fetchFromOKX<ApproveTransactionResponse>(url)
        return res.code === 0 ? res.data[0] : null
    }

    static async getQuotes(options: GetQuotesOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/quote', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        const res = await fetchFromOKX<GetQuotesResponse>(url)
        if (res.code === 0 && res.data) {
            // fix tokens
            res.data.forEach((quote) => {
                quote.fromToken = fixToken(quote.fromToken)
                quote.toToken = fixToken(quote.toToken)
                quote.dexRouterList.forEach((router) => {
                    router.subRouterList.forEach((subRouter) => {
                        subRouter.fromToken = fixToken(subRouter.fromToken)
                        subRouter.toToken = fixToken(subRouter.toToken)
                    })
                })
            })
        }
        return res
    }

    /**
     * Perform a token swap.
     * @param  options - The swap options.
     * @returns The response from the swap API.
     */
    static async getSwap(options: SwapOptions): Promise<SwapResponse> {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/swap', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        return fetchFromOKX<SwapResponse>(url)
    }

    /** Get token price in favor of swap quote API */
    static async getTokenPrice(address: string, chainId: string) {
        const intChainId = +chainId
        const tokens = await queryClient.fetchQuery({
            queryKey: ['okx-tokens', intChainId],
            queryFn: () => OKX.baseGetTokens(intChainId, '/api/v5/dex/aggregator/all-tokens'),
        })
        if (!tokens?.length) return
        const isNativeToken = isNativeTokenAddress(fromOkxNativeAddress(address))
        const fromToken =
            isNativeToken ?
                tokens.find((x) => {
                    const symbol = x.symbol.toLowerCase()
                    return symbol.includes('usdc') || symbol.includes('usdt')
                }) ?? tokens[0]
            :   null

        const options = {
            amount: rightShift(1, fromToken?.decimals ?? 18).toFixed(),
            fromTokenAddress: fromToken?.address ?? NATIVE_TOKEN_ADDRESS,
            chainId,
            toTokenAddress: toOkxNativeAddress(address),
        }
        const quoteRes = await queryClient.fetchQuery({
            queryKey: ['okx-swap', 'get-quotes', options],
            queryFn: () => OKX.getQuotes(options),
        })
        if (quoteRes.code !== 0 || !quoteRes.data.length) return
        const quote = quoteRes.data[0]
        return quote.toToken.tokenUnitPrice
    }

    static async getBridgeQuote(options: GetBridgeQuoteOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/cross-chain/quote', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        const res = await fetchFromOKX<GetBridgeQuoteResponse>(url)
        const [fromTokenPrice = '0', toTokenPrice = '0'] = await Promise.all([
            OKX.getTokenPrice(options.fromTokenAddress, options.fromChainId),
            OKX.getTokenPrice(options.toTokenAddress, options.toChainId),
        ])
        // Patch data
        res.data.forEach((quote) => {
            quote.fromToken.tokenUnitPrice = fromTokenPrice
            quote.toToken.tokenUnitPrice = toTokenPrice
            quote.toTokenAmount = quote.routerList[0]?.toTokenAmount
            quote.fromChainId = +quote.fromChainId
            quote.toChainId = +quote.fromChainId
            quote.routerList.forEach((router) => {
                router.router.crossChainFeeTokenAddress = fromOkxNativeAddress(router.router.crossChainFeeTokenAddress)
                ;[...router.fromDexRouterList, ...router.toDexRouterList].forEach((dexRouter) => {
                    dexRouter.subRouterList.forEach((subRouter) => {
                        subRouter.fromToken.tokenContractAddress = fromOkxNativeAddress(
                            subRouter.fromToken.tokenContractAddress,
                        )
                    })
                })
            })
        })
        return res
    }

    static async getBridgeSupportedChains(chainId?: number) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/cross-chain/supported/chain', {
            chainId,
        })
        const res = await fetchFromOKX<SupportedChainResponse>(url)
        if (res.code === 0) {
            res.data.forEach((item) => {
                item.chainId = +item.chainId
            })
            return res.data
        }
        return undefined
    }

    static async bridge(options: BridgeOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/cross-chain/build-tx', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        const res = await fetchFromOKX<GetBridgeResponse>(url)
        return res
    }

    static async getBridgeStatus(options: GetBridgeStatusOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/cross-chain/status', options)
        const res = await fetchFromOKX<GetBridgeStatusResponse>(url)
        // Patch data
        if (res.code === 0 && res.data.length) {
            res.data.forEach((record) => {
                record.fromChainId = +record.fromChainId
                record.toChainId = record.toChainId ? +record.toChainId : 0
            })
            return res.data[0]
        }
        return null
    }
}
