import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import { BIPS_BASE, ONE_INCH_BASE_URL } from '../../constants'
import type {
    SwapOneErrorResponse,
    SwapQuoteOneResponse,
    SwapQuoteOneRequest,
    SwapOneServerErrorResponse,
    SwapOneValidationErrorResponse,
} from '../../types'
import urlcat from 'urlcat'

import { getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'

export async function swapOneQuote(request: SwapQuoteOneRequest) {
    const params: Record<string, string | number> = {}
    Object.entries(request).map(([key, value]) => {
        params[key] = value
    })
    if (request.slippage) params.slippage = new BigNumber(request.slippage).dividedBy(BIPS_BASE).toFixed()

    const netType: NetworkType = getNetworkTypeFromChainId(request.chainId)!

    const response = await fetch(urlcat(ONE_INCH_BASE_URL[netType], 'swap', params))
    const response_ = (await response.json()) as SwapQuoteOneResponse | SwapOneErrorResponse

    const validationErrorResponse = response_ as SwapOneValidationErrorResponse
    if (validationErrorResponse.code)
        throw new Error(first(validationErrorResponse.validationErrors)?.reason ?? 'Unknown Error')

    const serverErrorResponse = response_ as SwapOneServerErrorResponse
    if (serverErrorResponse.reason)
        throw new Error(first(validationErrorResponse.validationErrors)?.reason || 'Unknown Error')

    const successResponse = response_ as SwapQuoteOneResponse
    return successResponse
}
