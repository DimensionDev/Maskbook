import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import { BIPS_BASE, ONE_INCH_BASE_URL } from '../../constants'
import type { SwapOneErrorResponse, SwapQuoteOneResponse, SwapQuoteOneRequest } from '../../types'
import urlcat from 'urlcat'

import { getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../../../../../../web3-providers/src/helpers'

export async function swapOneQuote(request: SwapQuoteOneRequest) {
    const params: Record<string, string | number> = Object.fromEntries(Object.entries(request))

    if (request.slippage) params.slippage = new BigNumber(request.slippage).dividedBy(BIPS_BASE).toFixed()

    const netType: NetworkType = getNetworkTypeFromChainId(request.chainId)!

    const response_ = await fetchJSON<SwapQuoteOneResponse | SwapOneErrorResponse>(
        urlcat(ONE_INCH_BASE_URL[netType], 'swap', params),
    )

    if ('code' in response_ || 'reason' in response_) {
        throw new Error(first(response_.validationErrors)?.reason ?? 'Unknown Error')
    }

    const successResponse = response_ as SwapQuoteOneResponse
    return successResponse
}
