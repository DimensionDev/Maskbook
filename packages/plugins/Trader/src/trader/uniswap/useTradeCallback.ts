import { identity, pickBy } from 'lodash-es'
import { useAsyncFn } from 'react-use'
import { BigNumber } from 'bignumber.js'
import type { TradeProvider } from '@masknet/public-api'
import type { SwapParameters } from '@uniswap/v2-sdk'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { uniswap } from '@masknet/web3-providers/helpers'
import type { SwapCall, Trade, TradeComputed } from '@masknet/web3-providers/types'
import { useSwapParameters as useTradeParameters } from './useTradeParameters.js'
import { useSwapErrorCallback } from '../../SiteAdaptor/trader/hooks/useSwapErrorCallback.js'

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

export function useTradeCallback(
    trade: TradeComputed<Trade> | null,
    tradeProvider?: TradeProvider,
    gasConfig?: GasConfig,
    allowedSlippage?: number,
) {
    const notifyError = useSwapErrorCallback()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()
    const tradeParameters = useTradeParameters(trade, tradeProvider, allowedSlippage)

    return useAsyncFn(async () => {
        if (!tradeParameters.length || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return
        }
        // step 1: estimate each trade parameter
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
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
                    const gas = await Web3.estimateTransaction?.(config, undefined, { chainId })
                    return {
                        call: x,
                        gasEstimate: new BigNumber(gas ?? 0),
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
                                error: new Error(uniswap.swapErrorToUserReadableMessage(error)),
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
                notifyError('Errors')
                return
            }
            const firstNoErrorCall = estimatedCalls.find((call): call is SwapCallEstimate => !('error' in call))

            bestCallOption = firstNoErrorCall
        }

        if (!bestCallOption) {
            notifyError('No Best Call Option')
            return
        }

        const {
            call: { address, calldata, value },
        } = bestCallOption

        try {
            const hash = await Web3.sendTransaction(
                {
                    from: account,
                    to: address,
                    data: calldata,
                    ...('gasEstimate' in bestCallOption ? { gas: bestCallOption.gasEstimate.toFixed() } : {}),
                    ...(!value || /^0x0*$/.test(value) ? {} : { value }),
                    ...pickBy(gasConfig, identity),
                },
                {
                    chainId,
                    overrides: { ...gasConfig },
                },
            )
            const receipt = await Web3.confirmTransaction(hash, { chainId })
            if (!receipt.status) return
            return receipt.transactionHash
        } catch (error: any) {
            if (!error?.code) {
                throw error
            }
            throw new Error(
                error?.message === 'Unable to add more requests.'
                    ? 'Unable to add more requests.'
                    : 'Transaction rejected.',
            )
        }
    }, [account, tradeParameters, gasConfig, chainId, pluginID, notifyError])
}
