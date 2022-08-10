import { first, last } from 'lodash-unified'
import { TransactionContext, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, TransactionParameter, getTraderConstants } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'
import { getTokenAmountDescription } from '../utils'

export class SwapDescriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        const { DODO_ETH_ADDRESS } = getTraderConstants(context.chainId)
        if (!context.methods?.find((x) => x.name)) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })
        const nativeToken = await connection?.getNativeToken({ chainId: context.chainId })

        const methods = context.methods

        for (const method of methods) {
            const parameters = method.parameters

            if (method.name === 'swapExactETHForTokens' && parameters?.path && parameters.amountOutMin) {
                const outputToken = await connection?.getFungibleToken(last(parameters!.path) ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(context.value, nativeToken)} for ${
                        outputToken?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        context.value,
                        nativeToken,
                    )} for ${getTokenAmountDescription(parameters!.amountOutMin, outputToken)} successfully.`,
                    failedDescription: `Failed to swap ${outputToken?.symbol ?? ''}.`,
                }
            }

            if (method.name === 'swapExactTokensForETH' && parameters?.path && parameters?.amountOutMin) {
                const outputToken = await connection?.getFungibleToken(last(parameters!.path) ?? '')

                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(context.value, nativeToken)} for ${
                        outputToken?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        context.value,
                        nativeToken,
                    )} for ${getTokenAmountDescription(parameters!.amountOutMin, outputToken)} successfully.`,
                    failedDescription: `Failed to swap ${outputToken?.symbol ?? ''}.`,
                }
            }

            if (
                method.name === 'swapExactTokensForTokens' &&
                parameters?.path &&
                parameters?.amountIn &&
                parameters?.amountOutMin
            ) {
                const tokenIn = await connection?.getFungibleToken(first(parameters!.path) ?? '')
                const tokenOut = await connection?.getFungibleToken(last(parameters!.path) ?? '')

                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(parameters!.amountIn, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters!.amountIn,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!.amountOut, tokenOut)} successfully.`,
                    failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                }
            }

            if (method.name === 'mixSwap') {
                const tokenIn = isSameAddress(parameters!.fromToken, DODO_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(parameters!.fromToken ?? '')
                const tokenOut = await connection?.getFungibleToken(parameters!.toToken ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(parameters!.fromTokenAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters!.minReturnAmount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!.amountOut, tokenOut)} successfully.`,
                    failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                }
            }

            if (method.name === 'multicall') {
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: 'Swap with UniSwap V3',
                }
            }
        }
        return
    }
}
