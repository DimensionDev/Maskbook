import type {
    SwapBancorRequest,
    ExpectedTargetAmountResponse,
    ExpectedSourceAmountResponse,
    TradeTransactionCreationResponse,
} from '../../types/bancor'
import urlcat from 'urlcat'
import { BANCOR_API_BASE_URL } from '../../constants'
import { calculateMinimumReturn } from './calculateMinimumReturn'

const getTargetAmount = async (request: SwapBancorRequest) => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId!]
    const url = urlcat(baseUrl, '/pricing/target-amount', {
        source_dlt_type: 'ethereum',
        source_dlt_id: request.fromToken?.address,
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken?.address,
        amount: Number.parseInt(request.fromAmount!, 10),
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
        source_dlt_id: request.fromToken?.address,
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken?.address,
        amount: Number.parseInt(request.toAmount!, 10),
    })
    const response = await fetch(url)
    if (response.ok) {
        const data: ExpectedSourceAmountResponse = await response.json()
        return data.amount
    }
    return undefined
}

export const swapTransactionBancor = async (request: SwapBancorRequest) => {
    const baseUrl = BANCOR_API_BASE_URL[request.chainId]
    const url = urlcat(baseUrl, '/transactions/swap', {
        source_dlt_type: 'ethereum',
        source_dlt_id: request.fromToken!.address,
        target_dlt_type: 'ethereum',
        target_dlt_id: request.toToken.address,
        amount: request.fromAmount,
        min_return: Number.parseInt(request.minimumReceived, 10),
        user_source_dlt_id: request.user,
    })
    const response = await fetch(url)
    if (response.ok) {
        const data: TradeTransactionCreationResponse = await response.json()
        return data
    }
    return null
}

export async function swapBancor(request: SwapBancorRequest): Promise<SwapBancorRequest> {
    if (!request.fromAmount) request.fromAmount = await getSourceAmount(request)
    if (!request.toAmount) request.toAmount = await getTargetAmount(request)
    const minimumReceived = calculateMinimumReturn(request)
    return {
        ...request,
        toAmount: request.toAmount,
        fromAmount: request.fromAmount,
        minimumReceived,
        fromTokenSymbol: request.fromToken?.symbol,
        toTokenSymbol: request.toToken?.symbol,
    }
}
