import { first, last } from 'lodash-unified'
import { i18NextInstance } from '@masknet/shared-base'
import UniswapV3MulticallFunctionExactInputABI from '@masknet/web3-contracts/abis/UniswapV3MulticallFunctionExactInput.json'
import Web3 from 'web3'
import { TransactionContext, isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    TransactionParameter,
    getTraderConstants,
    isNativeTokenAddress,
    getTokenConstant,
} from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'
import { getTokenAmountDescription } from '../utils'

export class SwapDescriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        const { DODO_ETH_ADDRESS, OPENOCEAN_ETH_ADDRESS, ZERO_X_ETH_ADDRESS, BANCOR_ETH_ADDRESS } = getTraderConstants(
            context.chainId,
        )
        console.log({ context })
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
                parameters?.amountIn
            ) {
                const outputToken = await connection?.getFungibleToken(first(parameters!.path) ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: outputToken?.address,
                    tokenInAmount: parameters?.amountIn,
                    description: `Swap ${getTokenAmountDescription(parameters!.amountIn, outputToken)} for ${
                        nativeToken?.symbol ?? ''
                    }.`,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters!.amountIn,
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

            // DODO: swap DODO for eth
            if (
                method.name === 'dodoSwapV2TokenToETH' &&
                parameters?.fromToken &&
                parameters?.fromTokenAmount &&
                parameters?.minReturnAmount
            ) {
                const tokenIn = await connection?.getFungibleToken(parameters!.fromToken ?? '')
                const tokenOut = nativeToken
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
            // Bancor
            if (
                method.name === 'convertByPath' &&
                parameters?._amount &&
                parameters?._beneficiary &&
                parameters?._minReturn &&
                parameters?._path
            ) {
                const tokenInAddress = first(parameters._path)
                const tokenOutAddress = last(parameters._path)
                const tokenIn = isSameAddress(tokenInAddress, BANCOR_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(tokenInAddress ?? '')
                const tokenOut = isSameAddress(tokenOutAddress, BANCOR_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(tokenOutAddress ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(parameters._amount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters._amount,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters._amount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!._minReturn, tokenOut)} successfully.`,
                    failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                }
            }
            // Uniswap V3
            if (method.name === 'multicall' && method.parameters?.[0]?.[0]) {
                try {
                    const web3 = new Web3()
                    const results = web3.eth.abi.decodeParameters(
                        UniswapV3MulticallFunctionExactInputABI,
                        method.parameters[0][0].slice(10),
                    ) as { [key: string]: string[] }

                    const [path, tokenOutAddress, _, amountIn, amountOutMinimum] = results['0']

                    const tokenInAddress = path.slice(0, 42)
                    const tokenIn = isNativeTokenAddress(tokenInAddress)
                        ? nativeToken
                        : await connection?.getFungibleToken(tokenInAddress ?? '')
                    const tokenOut = isNativeTokenAddress(tokenOutAddress)
                        ? nativeToken
                        : await connection?.getFungibleToken(tokenOutAddress ?? '')
                    return {
                        chainId: context.chainId,
                        title: 'Swap Token',
                        description: `Swap ${getTokenAmountDescription(amountIn, tokenIn)} for ${
                            tokenOut?.symbol ?? ''
                        }.`,
                        tokenInAddress: tokenIn?.address,
                        tokenInAmount: amountIn,
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            amountIn,
                            tokenIn,
                        )} for ${getTokenAmountDescription(amountOutMinimum, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    }
                } catch {
                    return {
                        chainId: context.chainId,
                        title: 'Swap Token',
                        description: 'Swap with UniSwap V3',
                    }
                }
            }
            // 0x ETH mainnet
            if (
                ['sellToUniswap', 'sellToPancakeSwap'].includes(method.name ?? '') &&
                parameters?.minBuyAmount &&
                parameters?.sellAmount &&
                parameters?.tokens
            ) {
                const tokenInAddress = first(parameters.tokens)
                const tokenOutAddress = last(parameters.tokens)
                const tokenIn = isSameAddress(tokenInAddress, ZERO_X_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(tokenInAddress ?? '')
                const tokenOut = isSameAddress(tokenOutAddress, ZERO_X_ETH_ADDRESS)
                    ? nativeToken
                    : await connection?.getFungibleToken(tokenOutAddress ?? '')
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    description: `Swap ${getTokenAmountDescription(parameters.sellAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.sellAmount,
                    successfulDescription: `Swap ${getTokenAmountDescription(
                        parameters.sellAmount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(parameters!.minBuyAmount, tokenOut)} successfully.`,
                    failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                }
            }

            // WETH <=> ETH
            if (['withdraw', 'deposit'].includes(method.name ?? '')) {
                const actionName =
                    method.name === 'withdraw'
                        ? i18NextInstance.t('plugin_trader_unwrap')
                        : i18NextInstance.t('plugin_trader_wrap')
                const amount = method.name === 'withdraw' ? parameters?.wad : context.value
                const WETH_ADDRESS = getTokenConstant(context.chainId, 'WETH_ADDRESS')
                const wethToken = await connection?.getFungibleToken(WETH_ADDRESS ?? '')

                const tokenIn = method.name === 'withdraw' ? nativeToken : wethToken
                const tokenOut = method.name === 'withdraw' ? wethToken : nativeToken
                return {
                    chainId: context.chainId,
                    title: `${actionName} Token`,
                    description: `${actionName} ${getTokenAmountDescription(amount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: amount,
                    successfulDescription: `${actionName} ${getTokenAmountDescription(
                        amount,
                        tokenIn,
                    )} for ${getTokenAmountDescription(amount, tokenOut)} successfully.`,
                    failedDescription: `Failed to ${actionName} ${tokenOut?.symbol ?? ''}.`,
                }
            }
        }
        return
    }
}
