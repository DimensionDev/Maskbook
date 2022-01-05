import type { TradeComputed, SwapQuoteResponse } from '../../types'
import { useMemo } from 'react'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import BigNumber from 'bignumber.js'
import { SUPPORTED_CHAIN_IDS } from './constants'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const { targetChainId } = TargetChainIdContext.useContainer()

    return useMemo(() => {
        if (!tradeComputed?.trade_ || !SUPPORTED_CHAIN_IDS.includes(targetChainId)) return 0
        return new BigNumber(tradeComputed.trade_.gas).toNumber()
    }, [targetChainId, tradeComputed])
}
