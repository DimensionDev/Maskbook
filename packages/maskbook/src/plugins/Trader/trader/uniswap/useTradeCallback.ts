import { useCallback, useState } from 'react'
import type { SwapParameters } from '@uniswap/v2-sdk'
import type { RouterV2 } from '@masknet/web3-contracts/types/RouterV2'
import { TransactionState, TransactionStateType, useAccount } from '@masknet/web3-shared'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import { SLIPPAGE_SETTINGS_DEFAULT, DEFAULT_TRANSACTION_DEADLINE } from '../../constants'
import type { SwapCall, Trade, TradeComputed } from '../../types'
import Services from '../../../../extension/service'
import BigNumber from 'bignumber.js'

function swapErrorToUserReadableMessage(error: any): string {
    let reason: string | undefined
    while (Boolean(error)) {
        reason = error.reason ?? error.message ?? reason
        error = error.error ?? error.data?.originalError
    }

    if (reason?.startsWith('execution reverted: ')) reason = reason.substr('execution reverted: '.length)

    switch (reason) {
        case 'UniswapV2Router: EXPIRED':
            return `The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.`
        case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
        case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
            return `This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.`
        case 'TransferHelper: TRANSFER_FROM_FAILED':
            return `The input token cannot be transferred. There may be an issue with the input token.`
        case 'UniswapV2: TRANSFER_FAILED':
            return `The output token cannot be transferred. There may be an issue with the output token.`
        case 'UniswapV2: K':
            return `The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.`
        case 'Too little received':
        case 'Too much requested':
        case 'STF':
            return `This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
        case 'TF':
            return `The output token cannot be transferred. There may be an issue with the output token. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
        default:
            if (reason?.includes('undefined is not an object')) {
                console.error(error, reason)
                return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
            }
            return `Unknown error${
                reason ? `: "${reason}"` : ''
            }. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
    }
}
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
    routerV2Contract: RouterV2 | null,
    allowedSlippage = SLIPPAGE_SETTINGS_DEFAULT,
    ddl = DEFAULT_TRANSACTION_DEADLINE,
) {
    const account = useAccount()
    const tradeParameters = useTradeParameters(trade, allowedSlippage, ddl)

    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    const tradeCallback = useCallback(async () => {
        if (!routerV2Contract) {
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
                    ...(!value || /^0x0*$/.test(value) ? {} : { value }),
                }

                return Services.Ethereum.estimateGas(config)
                    .then((gasEstimate) => {
                        return {
                            call: x,
                            gasEstimate: new BigNumber(gasEstimate),
                        }
                    })
                    .catch((error) => {
                        return Services.Ethereum.call(config)
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

            try {
                const hash = await Services.Ethereum.sendTransaction({
                    from: account,
                    to: address,
                    data: calldata,
                    ...('gasEstimate' in bestCallOption ? { gas: bestCallOption.gasEstimate.toFixed() } : {}),
                    ...(!value || /^0x0*$/.test(value) ? {} : { value }),
                })
                setTradeState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            } catch (error) {
                if (error?.code) {
                    const error_ = new Error('Transaction rejected.')
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
            }
        })
    }, [account, tradeParameters, routerV2Contract])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
