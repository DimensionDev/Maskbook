import { first, last } from 'lodash-unified'
import {
    TransactionContext,
    isSameAddress,
    TransactionDescriptor as TransactionDescriptorBase,
} from '@masknet/web3-shared-base'
import { ChainId, TransactionParameter, getTraderConstants, Transaction } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import { getTokenAmountDescription } from '../utils'

export interface SwapDescriptorBase<ChainId, Transaction> extends TransactionDescriptorBase<ChainId, Transaction> {
    /** The address of the token leveraged to swap other tokens */
    tokenInAddress?: string
    /** The amount of the token leveraged to swap other tokens */
    tokenInAmount?: string
}

export interface SwapDescriptorInterface {
    compute: (
        context: TransactionContext<ChainId, TransactionParameter>,
    ) => Promise<Omit<SwapDescriptorBase<ChainId, Transaction>, 'type' | '_tx'> | undefined>
}

export class SwapDescriptor implements SwapDescriptorInterface {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        const { DODO_ETH_ADDRESS, OPENOCEAN_ETH_ADDRESS, ZERO_X_ETH_ADDRESS } = getTraderConstants(context.chainId)
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
                    tokenInAddress: nativeToken?.address,
                    tokenInAmount: context.value,
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
                method.name === 'swapExactTokensForETH' &&
                parameters?.path &&
                parameters?.amountOutMin &&
                parameters?.amountInMin
            ) {
                const outputToken = await connection?.getFungibleToken(last(parameters!.path) ?? '')

                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: outputToken?.address,
                    tokenInAmount: parameters?.amountInMin,
                    description: `Swap ${getTokenAmountDescription(parameters!.amountInMin, outputToken)} for ${
                        nativeToken?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters!.amountInMin,
                        outputToken,
                    )} for ${getTokenAmountDescription(parameters!.amountOutMin, nativeToken)} successfully.`,
                    failedDescription: `Failed to swap ${nativeToken?.symbol ?? ''}.`,
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
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters!.amountIn,
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

            // DODO
            if (
                method.name === 'mixSwap' &&
                parameters?.fromToken &&
                parameters?.toToken &&
                parameters?.fromTokenAmount &&
                parameters?.minReturnAmount
            ) {
                const tokenIn = isSameAddress(parameters!.fromToken, DODO_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(parameters!.fromToken ?? '')
                const tokenOut = isSameAddress(parameters!.toToken, DODO_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(parameters!.toToken ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters!.fromTokenAmount,
                    description: `Swap ${getTokenAmountDescription(parameters!.fromTokenAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters!.fromTokenAmount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!.minReturnAmount, tokenOut)} successfully.`,
                    failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                }
            }

            // Openocean
            if (method.name === 'swap') {
                const _parameters = parameters as
                    | {
                          [key: string]: { [key: string]: string } | undefined
                      }
                    | undefined
                if (
                    !_parameters?.[1]?.srcToken ||
                    !_parameters?.[1]?.dstToken ||
                    !_parameters?.[1]?.amount ||
                    !_parameters?.[1]?.minReturnAmount
                )
                    return
                const tokenIn = isSameAddress(_parameters[1].srcToken, OPENOCEAN_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(_parameters[1].srcToken ?? '')
                const tokenOut = isSameAddress(_parameters[1].dstToken, OPENOCEAN_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(_parameters[1].dstToken ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: _parameters[1].amount,
                    description: `Swap ${getTokenAmountDescription(_parameters[1].amount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        _parameters[1].amount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!.minReturnAmount, tokenOut)} successfully.`,
                    failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                }
            }

            if (
                method.name === 'transformERC20' &&
                parameters?.inputToken &&
                parameters?.inputTokenAmount &&
                parameters?.minOutputTokenAmount &&
                parameters?.outputToken
            ) {
                const tokenIn = isSameAddress(parameters.inputToken, ZERO_X_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(parameters.inputToken ?? '')
                const tokenOut = isSameAddress(parameters.outputToken, ZERO_X_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(parameters.outputToken ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(parameters.inputTokenAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.inputTokenAmount,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters.inputTokenAmount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!.minOutputTokenAmount, tokenOut)} successfully.`,
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
