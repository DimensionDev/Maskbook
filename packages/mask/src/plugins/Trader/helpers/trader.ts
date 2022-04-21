import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ONE } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { BIPS_BASE } from '../constants'
import type { NativeTokenWrapper } from '../trader/native/useTradeComputed'
import type { TradeComputed } from '../types'

export function toBips(bips: number) {
    return new BigNumber(bips).dividedBy(BIPS_BASE)
}

export function isNativeTokenWrapper(trade: TradeComputed<unknown> | null): trade is TradeComputed<NativeTokenWrapper> {
    const trade_ = trade as TradeComputed<NativeTokenWrapper> | null
    return trade_?.trade_?.isNativeTokenWrapper ?? false
}

export const calculateMinimumReceived = ({
    toToken,
    toAmount,
    slippage,
}: {
    toToken: FungibleTokenDetailed
    toAmount: BigNumber
    slippage: number
}): BigNumber => {
    const slippageWei = new BigNumber(slippage).dividedBy(BIPS_BASE)
    const minReturnWei = toAmount.times(ONE.minus(slippageWei))
    return minReturnWei
}
