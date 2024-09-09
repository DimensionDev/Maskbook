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
import { convertNativeAddress, normalizeCode } from './helper.js'

/** request okx official API, and normalize the code */
function fetchFromOKX<T extends { code: number }>(url: string) {
    return fetchJSON<T>(url).then(normalizeCode)
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

    static async getTokens(chainId: ChainId): Promise<Array<FungibleToken<ChainId, SchemaType>> | undefined> {
        if (!chainId) return
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/all-tokens', {
            chainId,
        })
        const res = await fetchFromOKX<GetTokensResponse>(url)
        if (res.code !== 0) return
        const tokens = res.data
        return tokens.map((x) => {
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

    static async approveTransaction(chainId: string, tokenAddress: string, amount: string) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/approve-transaction', {
            chainId,
            tokenAddress,
            amount,
        })
        return fetchFromOKX<ApproveTransactionResponse>(url)
    }

    static async getQuotes(options: GetQuotesOptions) {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/quote', {
            ...options,
            fromTokenAddress: convertNativeAddress(options.fromTokenAddress),
            toTokenAddress: convertNativeAddress(options.toTokenAddress),
        })
        return fetchFromOKX<GetQuotesResponse>(url)
    }

    /**
     * Perform a token swap.
     * @param  params - The swap options.
     * @returns The response from the swap API.
     */
    static async swap(params: SwapOptions): Promise<SwapResponse> {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/swap', params)
        return fetchFromOKX<SwapResponse>(url)
    }
}
