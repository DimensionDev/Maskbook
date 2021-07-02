import { useCallback, useState } from 'react'
import type { Currency, TradeType } from '@uniswap/sdk-core'
import type { SwapParameters, Trade } from '@uniswap/v2-sdk'
import type { RouterV2 } from '@masknet/contracts/types/RouterV2'
import {
    addGasMargin,
    TransactionState,
    TransactionStateType,
    TransactionEventType,
    useAccount,
} from '@masknet/web3-shared'
import { useSwapParameters as useTradeParameters } from './useTradeParameters'
import { SLIPPAGE_TOLERANCE_DEFAULT, DEFAULT_TRANSACTION_DEADLINE } from '../../constants'
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
    trade: TradeComputed<Trade<Currency, Currency, TradeType>> | null,
    routerV2Contract: RouterV2 | null,
    allowedSlippage = SLIPPAGE_TOLERANCE_DEFAULT,
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
        const estimatedCalls = await Promise.all(
            tradeParameters.map(async (x) => {
                const { methodName, args, value } = x
                const config = !value || /^0x0*$/.test(value) ? {} : { value }

                // @ts-ignore
                const tx = routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](...args)

                return tx
                    .estimateGas({
                        from: account,
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
                    .catch(() => {
                        return tx
                            .call({
                                from: account,
                                to: routerV2Contract.options.address,
                                ...config,
                            })
                            .then(
                                () =>
                                    ({
                                        parameters: x,
                                        error: new Error('Unexpected issue with estimating the gas. Please try again.'),
                                    } as FailedCall),
                            )
                            .catch(
                                (error) =>
                                    ({
                                        parameters: x,
                                        error,
                                    } as FailedCall),
                            )
                    })
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

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            const {
                gasEstimated,
                parameters: { methodName, args, value },
            } = successfulCall
            const config = !value || /^0x0*$/.test(value) ? {} : { value }

            // @ts-ignore
            routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](...args)
                .send({
                    from: account,
                    gas: addGasMargin(gasEstimated).toFixed(),
                    ...config,
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setTradeState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, tradeParameters, routerV2Contract])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
