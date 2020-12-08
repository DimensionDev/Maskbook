import type { SwapParameters, Trade } from '@uniswap/sdk'
import { useCallback, useState } from 'react'
import { SLIPPAGE_TOLERANCE_DEFAULT, UNISWAP_DEFAULT_TRANSACTION_DEADLINE } from '../../constants'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import { addGasMargin } from '../../../../web3/helpers'
import BigNumber from 'bignumber.js'
import { TransactionState, TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import { useRouterV2Contract } from '../../contracts/uniswap/useRouterV2Contract'
import type { TradeComputed } from '../../types'

interface SuccessfulCall {
    parameters: SwapParameters
    gasEstimated: number
}

interface FailedCall {
    parameters: SwapParameters
    error: Error
}

export function useTradeCallback(
    trade: TradeComputed<Trade> | null,
    allowedSlippage: number = SLIPPAGE_TOLERANCE_DEFAULT,
    ddl: number = UNISWAP_DEFAULT_TRANSACTION_DEADLINE,
) {
    const routerV2Contract = useRouterV2Contract()
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

        // pre-step: start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate each trade parameter
        const estimatedCalls = await Promise.all(
            tradeParameters.map(async (x) => {
                const { methodName, args, value } = x
                const config = !value || /^0x0*$/.test(value) ? {} : { value }
                // @ts-ignore
                return routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](...args)
                    .estimateGas({
                        to: routerV2Contract.options.address,
                        ...config,
                    })
                    .then(
                        (gasEstimated) =>
                            ({
                                parameters: x,
                                gasEstimated,
                            } as SuccessfulCall),
                    )
                    .catch(
                        (error) =>
                            ({
                                parameters: x,
                                error,
                            } as FailedCall),
                    )
            }),
        )

        // step 2: validate estimation
        const successfulCall = estimatedCalls.find(
            (x, i, list): x is SuccessfulCall =>
                ('gasEstimated' in x && i === list.length - 1) || (list[i + 1] && 'gasEstimated' in list[i + 1]),
        )
        if (!successfulCall) {
            const failedCalls = estimatedCalls.filter((x): x is FailedCall => 'error' in x)
            setTradeState({
                type: TransactionStateType.FAILED,
                error:
                    failedCalls.length > 0 ? failedCalls[failedCalls.length - 1].error : new Error('Unexpected error'),
            })
            return
        }

        // step 3: blocking
        return new Promise<string>((resolve, reject) => {
            const {
                gasEstimated,
                parameters: { methodName, args, value },
            } = successfulCall
            const config = !value || /^0x0*$/.test(value) ? {} : { value }

            // @ts-ignore
            routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](...args).send(
                {
                    gas: addGasMargin(new BigNumber(gasEstimated)).toFixed(),
                    ...config,
                },
                (error, hash) => {
                    if (error) {
                        setTradeState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setTradeState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [tradeParameters, routerV2Contract])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
