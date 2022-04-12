import type { TradeComputed, SwapQuoteResponse } from '../../types'
import { useMemo } from 'react'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { ChainId } from '../../../../../../web3-shared/evm'
import BigNumber from 'bignumber.js'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const { targetChainId } = TargetChainIdContext.useContainer()

    return useMemo(() => {
        if (!tradeComputed?.trade_ || ![ChainId.Mainnet, ChainId.BSC, ChainId.Matic].includes(targetChainId)) return 0
        return new BigNumber(tradeComputed.trade_.gas).toNumber()
    }, [targetChainId, tradeComputed])
}
