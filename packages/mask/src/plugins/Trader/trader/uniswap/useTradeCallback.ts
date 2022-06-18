import { useAsyncFn } from 'react-use'
import BigNumber from 'bignumber.js'
import type { TradeProvider } from '@masknet/public-api'
import type { SwapParameters } from '@uniswap/v2-sdk'
import { GasOptionConfig, TransactionEventType } from '@masknet/web3-shared-evm'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import { swapErrorToUserReadableMessage } from '../../helpers'
import type { SwapCall, Trade, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
    const { targetChainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const tradeParameters = useTradeParameters(trade, tradeProvider, allowedSlippage)

    return useAsyncFn(async () => {
        if (!tradeParameters.length || !web3) {
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

                return web3.eth
                    .estimateGas(config)
                    .then((gasEstimate) => {
                        return {
                            call: x,
                            gasEstimate: new BigNumber(gasEstimate),
                        }
                    })
                    .catch(() => {
                        return web3.eth
                            .call(config)
                            .then(() => {
                                return {
                                    call: x,
                                    error: new Error('Gas estimate failed.'),
                                }
                            })
                            .catch((error) => {
                                return {
                                    call: x,
                                    error: new Error(swapErrorToUserReadableMessage(error)),
                                }
                            })
                    })
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

        return new Promise<string>(async (resolve, reject) => {
            if (!bestCallOption) {
                return
            }

            const {
                call: { address, calldata, value },
            } = bestCallOption

            web3.eth
                .sendTransaction({
                    from: account,
                    to: address,
                    data: calldata,
                    ...('gasEstimate' in bestCallOption ? { gas: bestCallOption.gasEstimate.toFixed() } : {}),
                    ...(!value || /^0x0*$/.test(value) ? {} : { value }),
                    ...gasConfig,
                })
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    if (!(error as any)?.code) {
                        reject(error)
                        return
                    }
                    const error_ = new Error(
                        error?.message === 'Unable to add more requests.'
                            ? 'Unable to add more requests.'
                            : 'Transaction rejected.',
                    )
                    reject(error_)
                })
        })
    }, [web3, account, tradeParameters, gasConfig])
}
