import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { pick } from 'lodash-unified'
import { useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import type { SwapBancorRequest, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { PluginTraderRPC } from '../../messages'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapBancorRequest> | null): AsyncState<number> {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const account = useAccount()
    const web3 = useWeb3({ chainId: targetChainId })

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!account || !trade) return 0

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)

        if (err) return 0

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        return web3.eth.estimateGas(pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from']))
    }, [trade, account, web3])
}
