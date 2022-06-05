import { formatBalance, TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'
import { first, last } from 'lodash-unified'

export class SwapDescriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        if (!context.name) return
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        const nativeToken = await connection?.getNativeToken({ chainId: context.chainId })

        switch (context.name) {
            case 'swapExactETHForTokens':
                const outputToken = await connection?.getFungibleToken(last(context.parameters!.path) ?? '')
                const inputAmount = formatBalance(context.value, nativeToken?.decimals, 2)
                const outputAmount = formatBalance(context.parameters!.amountOutMin, outputToken?.decimals, 2)
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${inputAmount} ${nativeToken?.symbol ?? ''} for ${outputAmount} ${
                        outputToken?.symbol ?? ''
                    }`,
                }
            case 'swapExactTokensForETH':
                const inToken = await connection?.getFungibleToken(first(context.parameters!.path) ?? '')
                const inAmount = formatBalance(context.parameters!.amountIn, inToken?.decimals, 2)
                const outAmount = formatBalance(context.parameters!.amountOutMin, nativeToken?.decimals, 2)

                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${inAmount} ${inToken?.symbol ?? ''} for ${outAmount} ${
                        nativeToken?.symbol ?? ''
                    }`,
                }
            case 'swapExactTokensForTokens':
                const tokenIn = await connection?.getFungibleToken(first(context.parameters!.path) ?? '')
                const tokenOut = await connection?.getFungibleToken(last(context.parameters!.path) ?? '')

                const amountIn = formatBalance(context.parameters!.amountIn, tokenIn?.decimals, 2)
                const amountOut = formatBalance(context.parameters!.amountOutMin, tokenOut?.decimals, 2)

                return {
                    chainId: context.chainId,
                    title: 'SwapToken',
                    description: `Swap ${amountIn} ${tokenIn?.symbol ?? ''} for ${amountOut} ${tokenOut?.symbol ?? ''}`,
                }
            case 'multicall':
                return {
                    chainId: context.chainId,
                    title: 'SwapToken',
                    description: 'Swap with UniSwap V3',
                }
            default:
                return
        }
    }
}
