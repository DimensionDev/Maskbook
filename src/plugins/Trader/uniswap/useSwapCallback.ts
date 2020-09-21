import type { Trade, SwapParameters } from '@uniswap/sdk'
import { useCallback } from 'react'
import { DEFAULT_SLIPPAGE_TOLERANCE, DEFAULT_TRANSACTION_DEADLINE } from '../constants'
import { useSwapParameters } from './useSwapParameters'
import { useRouterV2Contract } from '../contracts/useRouterV2Contract'
import { addGasMargin } from '../../../web3/helpers'
import BigNumber from 'bignumber.js'

interface SuccessfulCall {
    parameters: SwapParameters
    gasEstimated: number
}

interface FailedCall {
    parameters: SwapParameters
    error: Error
}

export enum SwapState {
    UNKNOWN,
    PENDING,
    DONE,
}

export function useSwapCallback(
    trade: Trade | null,
    allowedSlippage: number = DEFAULT_SLIPPAGE_TOLERANCE,
    ddl: number = DEFAULT_TRANSACTION_DEADLINE,
) {
    const routerV2Contract = useRouterV2Contract()
    const swapParameters = useSwapParameters(trade, allowedSlippage, ddl)

    return useCallback(async () => {
        if (!routerV2Contract) return

        // step 1: estimate each swap parameter
        const estimatedCalls = await Promise.all(
            swapParameters.map(async (x) => {
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
                ('gasEstimated' in x && i === list.length - 1) || 'gasEstimated' in list[i + 1],
        )
        if (!successfulCall) {
            const failedCalls = estimatedCalls.filter((x): x is FailedCall => 'error' in x)
            if (failedCalls.length > 0) throw failedCalls[failedCalls.length - 1].error
            throw new Error('Unexpected error')
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
                    if (error) reject(error)
                    else resolve(hash)
                },
            )
        })
    }, [swapParameters, routerV2Contract])
}
