import BigNumber from 'bignumber.js'
import { first } from 'lodash-es'
import { BIPS_BASE, ZRX_BASE_URL } from '../../constants'
import type {
    SwapErrorResponse,
    SwapQuoteRequest,
    SwapQuoteResponse,
    SwapServerErrorResponse,
    SwapValidationErrorResponse,
} from '../../types'
import type { NetworkType } from '@masknet/web3-shared'
import urlcat from 'urlcat'

export async function swapQuote(request: SwapQuoteRequest, networkType: NetworkType) {
    const params: Record<string, string | number> = {}
    Object.entries(request).map(([key, value]) => {
        params[key] = value
    })
    if (request.slippagePercentage)
        params.slippagePercentage = new BigNumber(request.slippagePercentage).dividedBy(BIPS_BASE).toFixed()
    if (request.buyTokenPercentageFee)
        params.buyTokenPercentageFee = new BigNumber(request.buyTokenPercentageFee).dividedBy(100).toFixed()

    const response = await fetch(urlcat(ZRX_BASE_URL[networkType], 'swap/v1/quote', params))
    const response_ = (await response.json()) as SwapQuoteResponse | SwapErrorResponse

    const validationErrorResponse = response_ as SwapValidationErrorResponse
    if (validationErrorResponse.code)
        throw new Error(first(validationErrorResponse.validationErrors)?.reason ?? 'Unknown Error')

    const serverErrorResponse = response_ as SwapServerErrorResponse
    if (serverErrorResponse.reason)
        throw new Error(first(validationErrorResponse.validationErrors)?.reason || 'Unknown Error')

    const successResponse = response_ as SwapQuoteResponse
    return successResponse
}
