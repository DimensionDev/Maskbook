import urlcat from 'urlcat'
import { OKX_HOST } from './constant.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type {
    ApproveTransactionResponse,
    GetLiquidityResponse,
    GetQuotesOptions,
    GetQuotesResponse,
    GetTokensResponse,
    SupportedChainResponse,
    SwapOptions,
    SwapResponse,
} from './types.js'
import { TokenType, type FungibleToken } from '@masknet/web3-shared-base'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'
import { convertNativeAddress } from './helper.js'

export class OKX {
    /**
     * @docs https://www.okx.com/web3/build/docs/waas/dex-get-aggregator-supported-chains
     */
    static async getSupportedChains() {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/supported/chain')
        const res = await fetchJSON<SupportedChainResponse>(url)
        return 'data' in res ? res.data : undefined
    }

    static async getTokens(chainId: ChainId): Promise<Array<FungibleToken<ChainId, SchemaType>> | undefined> {
        if (!chainId) return
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/all-tokens', {
            chainId,
        })
        const res = await fetchJSON<GetTokensResponse>(url)
        const tokens = 'data' in res ? res.data : undefined
        return tokens?.map((x) => {
            return {
                id: x.tokenContractAddress,
                chainId,
                name: x.tokenName,
                symbol: x.tokenSymbol,
                decimals: Number.parseInt(x.decimals, 10),
                logoURL: x.tokenLogoUrl,
                address: x.tokenContractAddress,
                type: TokenType.Fungible,
                schema: SchemaType.ERC20,
            } satisfies FungibleToken<ChainId, SchemaType>
        })
    }

    static async getLiquidity(chainId: string) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/get-liquidity', {
            chainId,
        })
        return fetchJSON<GetLiquidityResponse>(url)
    }

    static async approveTransaction(chainId: string, tokenAddress: string, amount: string) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/approve-transaction', {
            chainId,
            tokenAddress,
            amount,
        })
        return fetchJSON<ApproveTransactionResponse>(url)
    }

    static async getQuotes(options: GetQuotesOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/quote', {
            ...options,
            fromTokenAddress: convertNativeAddress(options.fromTokenAddress),
            toTokenAddress: convertNativeAddress(options.toTokenAddress),
        })
        const res = await fetchJSON<GetQuotesResponse>(url)
        return 'data' in res ? res.data : undefined
    }

    /**
     * Perform a token swap.
     * @param  params - The swap options.
     * @returns The response from the swap API.
     */
    static async swap(params: SwapOptions): Promise<SwapResponse> {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/swap', params)
        return fetchJSON<SwapResponse>(url)
    }
}
