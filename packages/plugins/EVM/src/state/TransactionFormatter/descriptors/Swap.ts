import { first, last } from 'lodash-unified'
import { formatBalance, TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'

export class SwapDescriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
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
                const inputAmount = formatBalance(context.value, nativeToken?.decimals, 2)
                const outputAmount = formatBalance(parameters!.amountOutMin, outputToken?.decimals, 2)
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${inputAmount} ${nativeToken?.symbol ?? ''} for ${outputAmount} ${
                        outputToken?.symbol ?? ''
                    }`,
                }
            }

            if (method.name === 'swapExactTokensForETH' && parameters?.path && parameters?.amountOutMin) {
                const outputToken = await connection?.getFungibleToken(last(parameters!.path) ?? '')
                const inputAmount = formatBalance(context.value, nativeToken?.decimals, 2)
                const outputAmount = formatBalance(parameters!.amountOutMin, outputToken?.decimals, 2)
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${inputAmount} ${nativeToken?.symbol ?? ''} for ${outputAmount} ${
                        outputToken?.symbol ?? ''
                    }`,
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

                const amountIn = formatBalance(parameters!.amountIn, tokenIn?.decimals, 2)
                const amountOut = formatBalance(parameters!.amountOutMin, tokenOut?.decimals, 2)

                return {
                    chainId: context.chainId,
                    title: 'SwapToken',
                    description: `Swap ${amountIn} ${tokenIn?.symbol ?? ''} for ${amountOut} ${tokenOut?.symbol ?? ''}`,
                }
            }

            if (method.name === 'multicall') {
                return {
                    chainId: context.chainId,
                    title: 'SwapToken',
                    description: 'Swap with UniSwap V3',
                }
            }
        }
        return
    }
}
