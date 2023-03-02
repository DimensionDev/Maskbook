import { toHex } from 'web3-utils'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { BigNumber } from 'bignumber.js'
import type { TradeProvider } from '@masknet/public-api'
import type { SwapParameters } from '@uniswap/v2-sdk'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Trade, TradeComputed, SwapCall } from '../../types/index.js'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useSwapParameters as useTradeParameters } from './useTradeParameters.js'
import { swapErrorToUserReadableMessage } from '../../helpers/index.js'
import { toFixed } from '@masknet/web3-shared-base'

interface FailedCall {
    parameters: SwapParameters
    error: Error
}

interface SwapCallEstimate {
    call: SwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
    call: SwapCall
    gasEstimate: BigNumber
}

interface FailedCall extends SwapCallEstimate {
    call: SwapCall
    error: Error
}

export function useTradeGasLimit(trade: TradeComputed<Trade> | null, tradeProvider: TradeProvider): AsyncState<string> {
    const { account, chainId: targetChainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const tradeParameters = useTradeParameters(trade, tradeProvider)
    const connection = useWeb3Connection(pluginID, { chainId: targetChainId })

    return useAsync(async () => {
        if (!connection || pluginID !== NetworkPluginID.PLUGIN_EVM) return '0'

        // step 1: estimate each trade parameter
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
            tradeParameters.map(async (x) => {
                const { address, calldata, value } = x
                const config = {
                    from: account,
                    to: address,
                    data: calldata,
                    ...(!value || /^0x0*$/.test(value) ? {} : { value: toHex(value) }),
                }

                try {
                    const gas = await connection.estimateTransaction?.(config)
                    return {
                        call: x,
                        gasEstimate: gas ?? '0',
                    }
                } catch {
                    return connection
                        .callTransaction(config)
                        .then(() => {
                            return {
                                call: x,
                                error: new Error('Gas estimate failed'),
                            }
                        })
                        .catch((error) => {
                            return {
                                call: x,
                                error: new Error(swapErrorToUserReadableMessage(error)),
                            }
                        })
                }
            }),
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls.find(
            (el, ix, list): el is SuccessfulCall =>
                'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        // check if any calls errored with a recognizable error
        if (!bestCallOption) {
            const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
            if (errorCalls.length > 0) {
                return
            }
            const firstNoErrorCall = estimatedCalls.find((call): call is SwapCallEstimate => !('error' in call))
            if (!firstNoErrorCall) {
                return
            }
            bestCallOption = firstNoErrorCall
        }

        return 'gasEstimate' in bestCallOption ? toFixed(bestCallOption.gasEstimate) : '0'
    }, [tradeParameters.length, connection, pluginID])
}
