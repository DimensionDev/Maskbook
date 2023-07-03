import urlcat from 'urlcat'
import { checksumAddress } from '@masknet/web3-shared-evm'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type {
    BancorApiErrorResponse,
    ExpectedTargetAmountResponse,
    ExpectedSourceAmountResponse,
    SwapBancorRequest,
    TradeTransactionCreationResponse,
} from '../../types/bancor.js'
import { BANCOR_API_BASE_URL } from '../../constants/index.js'
import { calculateMinimumReturn } from './calculateMinimumReturn.js'
import { TradeStrategy } from '../../types/index.js'

const roundDecimal = (value: number | string | undefined, decimals: number) => {
    return Math.round(Number(value || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const getTargetAmount = async (
    request: SwapBancorRequest,
): Promise<ExpectedTargetAmountResponse | BancorApiErrorResponse> => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId]
    const url = urlcat(baseUrl, '/pricing/target-amount', {
        source_dlt_type: 'ethereum',
        source_dlt_id: request.fromToken?.address,
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken?.address,
        amount: roundDecimal(request.fromAmount, request.fromToken.decimals),
    })
    return fetchJSON(url)
}

const getSourceAmount = async (
    request: SwapBancorRequest,
): Promise<ExpectedSourceAmountResponse | BancorApiErrorResponse> => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId]
    const url = urlcat(baseUrl, '/pricing/source-amount', {
        source_dlt_type: 'ethereum',
        source_dlt_id: checksumAddress(request.fromToken?.address),
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken?.address,
        amount: roundDecimal(request.toAmount, request.toToken.decimals),
    })
    return fetchJSON(url)
}

export const swapTransactionBancor = async (
    request: SwapBancorRequest,
): Promise<[TradeTransactionCreationResponse, BancorApiErrorResponse | null]> => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId]
    const url = urlcat(baseUrl, '/transactions/swap', {
        source_dlt_type: 'ethereum',
        source_dlt_id: checksumAddress(request.fromToken.address),
        target_dlt_type: 'ethereum',
        target_dlt_id: checksumAddress(request.toToken.address),
        amount: roundDecimal(request.fromAmount, request.fromToken.decimals),
        min_return: roundDecimal(request.minimumReceived, request.toToken.decimals),
        user_source_dlt_id: request.user,
    })
    const response = await fetch(url)
    if (response.ok) {
        const data = await response.json()
        return [data, null]
    }
    const error = await response.json()
    return [null as any, error]
}

export async function swapBancor(request: SwapBancorRequest): Promise<SwapBancorRequest | null> {
    const { fromToken, toToken, slippage, strategy } = request
    const isExactIn = strategy === TradeStrategy.ExactIn

    const response = isExactIn ? await getTargetAmount(request) : await getSourceAmount(request)
    const validationErrorResponse = response as BancorApiErrorResponse

    if (validationErrorResponse.error) {
        throw new Error(validationErrorResponse.error?.messages?.[0] || 'Unknown Error')
    }

    const { amount } = response as ExpectedTargetAmountResponse
    const toAmount = isExactIn ? amount : request.toAmount
    const fromAmount = isExactIn ? request.fromAmount : amount

    return {
        ...request,
        toAmount,
        fromAmount,
        minimumReceived: calculateMinimumReturn({ toToken, toAmount, slippage }),
        fromTokenSymbol: fromToken?.symbol,
        toTokenSymbol: toToken?.symbol,
    }
}
