import { toHex } from 'web3-utils'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { BigNumber } from 'bignumber.js'
import type { TradeProvider } from '@masknet/public-api'
import type { SwapParameters } from '@uniswap/v2-sdk'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Trade, TradeComputed, SwapCall } from '../../types/index.js'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { toFixed } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import { useSwapParameters as useTradeParameters } from './useTradeParameters.js'
import { swapErrorToUserReadableMessage } from '../../helpers/index.js'

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
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()
    const tradeParameters = useTradeParameters(trade, tradeProvider)

    return useAsync(async () => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return '0'

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
                    const gas = await Web3.estimateTransaction?.(config, undefined, { chainId })
                    return {
                        call: x,
                        gasEstimate: gas ?? '0',
                    }
                } catch (error) {
                    return Web3.callTransaction(config, { chainId })
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
    }, [chainId, tradeParameters.length, pluginID])
}
