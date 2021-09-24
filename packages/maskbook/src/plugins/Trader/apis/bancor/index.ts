import type {
    SwapBancorRequest,
    ExpectedTargetAmountResponse,
    ExpectedSourceAmountResponse,
    TradeTransactionCreationResponse,
    TradeTransactionCreationError,
} from '../../types/bancor'
import urlcat from 'urlcat'
import { BANCOR_API_BASE_URL } from '../../constants'
import { calculateMinimumReturn } from './calculateMinimumReturn'
import { toChecksumAddress } from 'web3-utils'

const roundDecimal = (value: number | string | undefined, decimals: number) => {
    return Math.round(Number(value || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const getTargetAmount = async (request: SwapBancorRequest) => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId!]
    const url = urlcat(baseUrl, '/pricing/target-amount', {
        source_dlt_type: 'ethereum',
        source_dlt_id: request.fromToken?.address,
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken?.address,
        amount: roundDecimal(request.fromAmount, request.fromToken.decimals),
    })
    const response = await fetch(url)
    if (response.ok) {
        const data: ExpectedTargetAmountResponse = await response.json()
        return data.amount
    }
    return undefined
}

const getSourceAmount = async (request: SwapBancorRequest) => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId!]
    const url = urlcat(baseUrl, '/pricing/source-amount', {
        source_dlt_type: 'ethereum',
        source_dlt_id: toChecksumAddress(request.fromToken?.address),
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken?.address,
        amount: roundDecimal(request.toAmount, request.toToken.decimals),
    })
    const response = await fetch(url)
    if (response.ok) {
        const data: ExpectedSourceAmountResponse = await response.json()
        return data.amount
    }
    return undefined
}

export const swapTransactionBancor = async (
    request: SwapBancorRequest,
): Promise<[TradeTransactionCreationResponse, TradeTransactionCreationError | null]> => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId]
    const url = urlcat(baseUrl, '/transactions/swap', {
        source_dlt_type: 'ethereum',
        source_dlt_id: toChecksumAddress(request.fromToken.address),
        target_dlt_type: 'ethereum',
        target_dlt_id: toChecksumAddress(request.toToken.address),
        amount: roundDecimal(request.fromAmount, request.fromToken.decimals),
        min_return: roundDecimal(request.minimumReceived, request.toToken.decimals),
        user_source_dlt_id: request.user,
    })
    const response = await fetch(url)
    if (response.ok) {
        const data: TradeTransactionCreationResponse = await response.json()
        return [data, null]
    }
    const error: TradeTransactionCreationError = await response.json()
    return [null as any, error]
}

export async function swapBancor(request: SwapBancorRequest): Promise<SwapBancorRequest> {
    const { fromToken, toToken, slippage } = request
    const toAmount = request.toAmount ? request.toAmount : await getTargetAmount(request)
    const fromAmount = request.fromAmount ? request.fromAmount : await getSourceAmount(request)
    return {
        ...request,
        toAmount,
        fromAmount,
        minimumReceived: calculateMinimumReturn({ toToken, toAmount, slippage }),
        fromTokenSymbol: fromToken?.symbol,
        toTokenSymbol: toToken?.symbol,
    }
}
