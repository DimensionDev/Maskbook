import { ChainId, EthereumTokenType, useAccount } from '@masknet/web3-shared-evm'
import { useNativeTokenWrapperContract } from '@masknet/web3-shared-evm/contracts/useWrappedEtherContract'
import { useAsync } from 'react-use'
import type { TradeComputed } from '../types'
import type { NativeTokenWrapper } from './native/useTradeComputed'
import { TradeStrategy } from '../types'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useNativeTradeGasLimit(
    trade: TradeComputed<NativeTokenWrapper> | null,
    chainId?: ChainId,
): AsyncState<number> {
    const account = useAccount()
    const wrapperContract = useNativeTokenWrapperContract(chainId)

    return useAsync(async () => {
        if (!trade?.trade_?.isNativeTokenWrapper || !trade.inputToken || !trade.outputToken) return 0

        const tradeAmount = trade.inputAmount.toFixed()

        if (!tradeAmount || !wrapperContract) return 0

        if (
            (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.type === EthereumTokenType.Native) ||
            (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.type === EthereumTokenType.Native)
        ) {
            return wrapperContract.methods.deposit().estimateGas({ from: account, value: tradeAmount })
        }

        return 0
    }, [account, wrapperContract, trade])
}
