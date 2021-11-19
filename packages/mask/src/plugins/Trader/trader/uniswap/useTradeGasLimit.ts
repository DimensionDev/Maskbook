import type { Trade, TradeComputed } from '../../types'
import { useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import type { TradeProvider } from '@masknet/public-api'
import { last } from 'lodash-es'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useAsync } from 'react-use'

export function useTradeGasLimit(trade: TradeComputed<Trade> | null, tradeProvider: TradeProvider) {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3(false, targetChainId)
    const account = useAccount()
    const tradeParameters = useTradeParameters(trade, tradeProvider)

    return useAsync(async () => {
        const estimateGases = await Promise.all(
            tradeParameters.map(async (x) => {
                const { address, calldata, value } = x
                const config = {
                    from: account,
                    to: address,
                    data: calldata,
                    ...(!value || /^0x0*$/.test(value)
                        ? {}
                        : { value: `0x${Number.parseInt(value, 16).toString(16)}` }),
                }
                try {
                    return web3.eth.estimateGas(config)
                } catch {
                    return 0
                }
            }),
        )
        return last(estimateGases)
    }, [tradeParameters.length])
}
