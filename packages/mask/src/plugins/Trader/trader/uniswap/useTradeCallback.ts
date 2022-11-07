import { useAsyncFn } from 'react-use'
import { BigNumber } from 'bignumber.js'
import type { TradeProvider } from '@masknet/public-api'
import type { SwapParameters } from '@uniswap/v2-sdk'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { useSwapParameters as useTradeParameters } from './useTradeParameters.js'
import { swapErrorToUserReadableMessage } from '../../helpers/index.js'
import type { SwapCall, Trade, TradeComputed } from '../../types/index.js'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

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
    gasConfig?: GasOptionConfig,
    allowedSlippage?: number,
) {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId })
    const tradeParameters = useTradeParameters(trade, tradeProvider, allowedSlippage)

    return useAsyncFn(async () => {
        if (!tradeParameters.length || !connection || pluginID !== NetworkPluginID.PLUGIN_EVM) {
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

                if (!connection.estimateTransaction) {
                    return {
                        call: x,
                        gasEstimate: ZERO,
                    }
                }
                try {
                    const gas = await connection.estimateTransaction?.(config)
                    return {
                        call: x,
                        gasEstimate: new BigNumber(gas ?? 0),
                    }
                } catch (error) {
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

        if (!bestCallOption) {
            return
        }

        const {
            call: { address, calldata, value },
        } = bestCallOption

        try {
            const hash = await connection.sendTransaction(
                {
                    from: account,
                    to: address,
                    data: calldata,
                    ...('gasEstimate' in bestCallOption ? { gas: bestCallOption.gasEstimate.toFixed() } : {}),
                    ...(!value || /^0x0*$/.test(value) ? {} : { value }),
                    ...gasConfig,
                },
                {
                    chainId,
                },
            )
            const receipt = await connection.getTransactionReceipt(hash)
            return receipt?.transactionHash
        } catch (error: any) {
            if (!(error as any)?.code) {
                throw error
            }
            throw new Error(
                error?.message === 'Unable to add more requests.'
                    ? 'Unable to add more requests.'
                    : 'Transaction rejected.',
            )
        }
    }, [connection, account, tradeParameters, gasConfig, chainId, pluginID])
}
