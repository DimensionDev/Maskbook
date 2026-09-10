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
    GetAllTokenBalancesByAddressResponse,
    GetBridgeQuoteOptions,
    GetBridgeQuoteResponse,
    GetBridgeResponse,
    GetBridgeStatusOptions,
    GetBridgeStatusResponse,
    GetLiquidityResponse,
    GetQuotesOptions,
    GetQuotesResponse,
    GetTokensResponse,
    SupportedChainResponse,
    SwapOptions,
    SwapResponse,
} from './types.js'
/** request okx official API, and normalize the code */
function fetchFromOKX<T extends { code: number }>(input: RequestInfo | URL, init?: RequestInit) {
    if (process.env.NODE_ENV === 'development' && typeof input === 'string' && input.includes('0x00000')) {
        console.warn('Do you forget to convert to okx native address?', input)
    }
    return fetchJSON<T>(input, init).then(normalizeCode)
}

export const OKX = {
    /**
     * @docs https://www.okx.com/web3/build/docs/waas/dex-get-aggregator-supported-chains
     */
    async getSupportedChains() {
        const url = urlcat(OKX_HOST, '/api/v6/dex/aggregator/supported/chain')
        const res = await fetchFromOKX<SupportedChainResponse>(url)
        if (res.code === 0) return res.data
        throw new Error('Failed to get supported chains')
    },

    async baseGetTokens(chainId: ChainId, apiRoute: string) {
        if (!chainId) return null
        const url = urlcat(OKX_HOST, apiRoute, {
            chainIndex: chainId,
        })
        const res = await fetchFromOKX<GetTokensResponse>(url)
        if (res.code !== 0) throw new Error('Failed to get tokens')
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
                    const address = fromOkxNativeAddress(x.tokenContractAddress)
                    return {
                        id: address,
                        chainId,
                        name: x.tokenName,
                        symbol: x.tokenSymbol,
                        // string to number for /api/v6/dex/aggregator/all-tokens
                        decimals: +x.decimals,
                        logoURL: x.tokenLogoUrl,
                        address,
                        type: TokenType.Fungible,
                        schema: SchemaType.ERC20,
                    } satisfies FungibleToken<ChainId, SchemaType>
                })
        )
    },

    async getTokens(chainId: ChainId): Promise<Array<FungibleToken<ChainId, SchemaType>> | null> {
        return OKX.baseGetTokens(chainId, '/api/v6/dex/aggregator/all-tokens')
    },

    async getLiquidity(chainId: string) {
        const url = urlcat(OKX_HOST, '/api/v6/dex/aggregator/get-liquidity', {
            chainIndex: chainId,
        })
        const res = await fetchFromOKX<GetLiquidityResponse>(url)
        if (res.code !== 0) throw new Error('Failed to get liquidity')
        return res
    },

    async getApproveTx(options: ApproveTransactionOptions) {
        const url = urlcat(OKX_HOST, '/api/v6/dex/aggregator/approve-transaction', options)
        const res = await fetchFromOKX<ApproveTransactionResponse>(url)
        if (res.code === 0) return res.data[0]
        throw new Error('Failed to get approve transaction')
    },

    async getQuotes(options: GetQuotesOptions) {
        const url = urlcat(OKX_HOST, '/api/v6/dex/aggregator/quote', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        const res = await fetchFromOKX<GetQuotesResponse>(url)
        if (res.code !== 0) throw new Error('Failed to get quotes')
        if (res.data) {
            // fix tokens
            res.data.forEach((quote) => {
                quote.fromToken = fixToken(quote.fromToken)
                quote.toToken = fixToken(quote.toToken)
                quote.dexRouterList.forEach((router) => {
                    router.fromToken = fixToken(router.fromToken)
                    router.toToken = fixToken(router.toToken)
                })
            })
        }
        return res
    },

    /**
     * Perform a token swap.
     * @param  options - The swap options.
     * @returns The response from the swap API.
     */
    async getSwap(options: SwapOptions): Promise<SwapResponse> {
        const url = urlcat(OKX_HOST, '/api/v6/dex/aggregator/swap', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        return fetchFromOKX<SwapResponse>(url)
    },

    /** Get token price in favor of swap quote API */
    async getTokenPrice(address: string, chainId: string) {
        const intChainId = +chainId
        const tokens = await queryClient.fetchQuery({
            queryKey: ['okx-tokens', intChainId],
            queryFn: () => OKX.baseGetTokens(intChainId, '/api/v6/dex/aggregator/all-tokens'),
        })
        if (!tokens?.length) return
        const isNativeToken = isNativeTokenAddress(fromOkxNativeAddress(address))
        const fromToken =
            isNativeToken ?
                (tokens.find((x) => {
                    const symbol = x.symbol.toLowerCase()
                    return symbol.includes('usdc') || symbol.includes('usdt')
                }) ?? tokens[0])
            :   null

        const options = {
            amount: rightShift(1, fromToken?.decimals ?? 18).toFixed(),
            fromTokenAddress: fromToken?.address ?? NATIVE_TOKEN_ADDRESS,
            chainIndex: chainId,
            toTokenAddress: toOkxNativeAddress(address),
        }
        const quoteRes = await queryClient.fetchQuery({
            queryKey: ['okx-swap', 'get-quotes', options],
            queryFn: () => OKX.getQuotes(options),
        })
        if (quoteRes.code !== 0 || !quoteRes.data.length) return
        const quote = quoteRes.data[0]
        return quote.toToken.tokenUnitPrice
    },

    async getBridgeQuote(options: GetBridgeQuoteOptions) {
        const url = urlcat(OKX_HOST, '/api/v6/dex/cross-chain/quote', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        const res = await fetchFromOKX<GetBridgeQuoteResponse>(url)
        if (res.code !== 0) throw new Error('Failed to get bridge quote')
        const [fromTokenPrice = '0', toTokenPrice = '0'] = await Promise.all([
            OKX.getTokenPrice(options.fromTokenAddress, options.fromChainIndex),
            OKX.getTokenPrice(options.toTokenAddress, options.toChainIndex),
        ])
        // Patch data
        res.data.forEach((quote) => {
            quote.fromToken.tokenUnitPrice = fromTokenPrice
            quote.toToken.tokenUnitPrice = toTokenPrice
            quote.toTokenAmount = quote.routerList[0]?.toTokenAmount
            quote.fromChainIndex = +quote.fromChainIndex
            quote.toChainIndex = +quote.toChainIndex
            quote.routerList.forEach((router) => {
                router.crossChainFeeTokenAddress = fromOkxNativeAddress(router.crossChainFeeTokenAddress)
            })
        })
        return res
    },

    async getBridgeSupportedChains() {
        // The dedicated cross-chain supported chains endpoint was removed in v6,
        // the aggregator supported chains serve both swap and bridge modes now.
        const url = urlcat(OKX_HOST, '/api/v6/dex/aggregator/supported/chain')
        const res = await fetchFromOKX<SupportedChainResponse>(url)
        if (res.code === 0) {
            res.data.forEach((item) => {
                item.chainId = +item.chainId
            })
            return res.data
        }
        throw new Error('Failed to get supported chains')
    },

    async bridge(options: BridgeOptions) {
        const url = urlcat(OKX_HOST, '/api/v6/dex/cross-chain/swap', {
            ...options,
            fromTokenAddress: toOkxNativeAddress(options.fromTokenAddress),
            toTokenAddress: toOkxNativeAddress(options.toTokenAddress),
        })
        const res = await fetchFromOKX<GetBridgeResponse>(url)
        return res
    },

    async getBridgeStatus(options: GetBridgeStatusOptions) {
        const url = urlcat(OKX_HOST, '/api/v6/dex/cross-chain/status', options)
        const res = await fetchFromOKX<GetBridgeStatusResponse>(url)
        if (res.code !== 0) throw new Error('Failed to get bridge status')
        // Patch data
        if (res.data.length) {
            const record = res.data[0]
            // The v6 states differ from v5 (e.g. NOT_FOUND for orders not indexed yet),
            // normalize them to the v5-style states the UI relies on, any non-final state is PENDING
            const rawStatus = record.status as string
            const failureStates = ['FAIL', 'FAILED', 'FAILURE', 'REFUND', 'FROM_FAILURE']
            record.status =
                rawStatus === 'SUCCESS' ? 'SUCCESS'
                : failureStates.includes(rawStatus) ? 'FAILURE'
                : 'PENDING'
            // v6 renamed fromTxHash to txHash, keep the v5-style field for the UI
            record.fromTxHash ??= record.txHash
            return record
        }
        return
    },

    async getUserTokenBalances(chainId: ChainId | ChainId[], account: string) {
        // The wallet APIs are still served by v5, which is not affected by the dex v5 sunset.
        const url = urlcat(OKX_HOST, '/api/v5/wallet/asset/all-token-balances-by-address', {
            chains: chainId,
            address: account,
        })
        const res = await fetchFromOKX<GetAllTokenBalancesByAddressResponse>(url)
        if (res.code !== 0) throw new Error('Failed to get user token balances')
        return res.data[0].tokenAssets
    },
}
