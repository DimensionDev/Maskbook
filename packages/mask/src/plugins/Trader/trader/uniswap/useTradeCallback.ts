import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import type { SwapParameters } from '@uniswap/v2-sdk'
import { GasOptionConfig, TransactionState, TransactionStateType, useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import type { SwapCall, Trade, TradeComputed } from '../../types'
import { swapErrorToUserReadableMessage } from '../../helpers'
import type { TradeProvider } from '@masknet/public-api'
import { TargetChainIdContext } from '../useTargetChainIdContext'

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
    const web3 = useWeb3({ chainId: targetChainId })
    const account = useAccount()
    const tradeParameters = useTradeParameters(trade, tradeProvider, allowedSlippage)

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    const tradeCallback = useCallback(async () => {
        if (!tradeParameters.length) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

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
                    .then((gasEstimate) => ({
                        call: x,
                        gasEstimate: new BigNumber(gasEstimate),
                    }))
                    .catch((error) =>
                        web3.eth
                            .call(config)
                            .then(() => ({
                                call: x,
                                error: new Error('Gas estimate failed.'),
                            }))
                            .catch((error) => ({
                                call: x,
                                error: new Error(swapErrorToUserReadableMessage(error)),
                            })),
                    )
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
                setTradeState({
                    type: TransactionStateType.FAILED,
                    error: errorCalls[errorCalls.length - 1].error,
                })
                return
            }
            const firstNoErrorCall = estimatedCalls.find((call): call is SwapCallEstimate => !('error' in call))
            if (!firstNoErrorCall) {
                setTradeState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Unexpected error. Could not estimate gas for the swap.'),
                })
                return
            }
            bestCallOption = firstNoErrorCall
        }

        return new Promise<string>(async (resolve, reject) => {
            if (!bestCallOption) {
                setTradeState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Bad call options.'),
                })
                return
            }

            const {
                call: { address, calldata, value },
            } = bestCallOption

            web3.eth.sendTransaction(
                {
                    from: account,
                    to: address,
                    data: calldata,
                    ...('gasEstimate' in bestCallOption ? { gas: bestCallOption.gasEstimate.toFixed() } : {}),
                    ...(!value || /^0x0*$/.test(value) ? {} : { value }),
                    ...gasConfig,
                },
                async (error, hash) => {
                    if (error) {
                        if ((error as any)?.code) {
                            const error_ = new Error(
                                (error as any)?.message === 'Unable to add more requests.'
                                    ? 'Unable to add more requests.'
                                    : 'Transaction rejected.',
                            )
                            setTradeState({
                                type: TransactionStateType.FAILED,
                                error: error_,
                            })
                            reject(error_)
                        } else {
                            setTradeState({
                                type: TransactionStateType.FAILED,
                                error: new Error(`Swap failed: ${swapErrorToUserReadableMessage(error)}`),
                            })
                        }
                    } else {
                        setTradeState({
                            type: TransactionStateType.HASH,
                            hash: hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [web3, account, tradeParameters, gasConfig])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
