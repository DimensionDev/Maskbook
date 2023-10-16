import { first, last } from 'lodash-es'
import { i18NextInstance } from '@masknet/shared-base'
import UniswapV3MulticallFunctionExactInputABI from '@masknet/web3-contracts/abis/UniswapV3MulticallFunctionExactInput.json'
import UniswapV3MulticallFunctionExactInputSingleABI from '@masknet/web3-contracts/abis/UniswapV3MulticallFunctionExactInputSingle.json'
import { type TransactionContext, isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    type TransactionParameter,
    getTraderConstants,
    isNativeTokenAddress,
    getTokenConstant,
    abiCoder,
} from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import { BaseDescriptor } from './Base.js'

export class SwapDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        const { DODO_ETH_ADDRESS, OPENOCEAN_ETH_ADDRESS, ZERO_X_ETH_ADDRESS, BANCOR_ETH_ADDRESS } = getTraderConstants(
            context.chainId,
        )
        if (!context.methods?.find((x) => x.name)) return

        const nativeToken = await this.Web3.getNativeToken({ chainId: context.chainId })

        for (const method of context.methods) {
            const parameters = method.parameters

            if (method.name === 'swapExactETHForTokens' && parameters?.path && parameters.amountOutMin) {
                const outputToken = await this.Hub.getFungibleToken(last(parameters.path) ?? '', {
                    chainId: context.chainId,
                })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: nativeToken?.address,
                    tokenInAmount: context.value,
                    description: `Swap ${getTokenAmountDescription(context.value, nativeToken)} for ${
                        outputToken?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            context.value,
                            nativeToken,
                        )} for ${getTokenAmountDescription(parameters.amountOutMin, outputToken)} successfully.`,
                        failedDescription: `Failed to swap ${outputToken?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }

            if (
                method.name === 'swapExactTokensForETH' &&
                parameters?.path &&
                parameters?.amountOutMin &&
                parameters?.amountIn
            ) {
                const outputToken = await this.Hub.getFungibleToken(first(parameters.path) ?? '', {
                    chainId: context.chainId,
                })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: outputToken?.address,
                    tokenInAmount: parameters?.amountIn,
                    description: `Swap ${getTokenAmountDescription(parameters.amountIn, outputToken)} for ${
                        nativeToken?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.amountIn,
                            outputToken,
                        )} for ${getTokenAmountDescription(parameters.amountOutMin, nativeToken)} successfully.`,
                        failedDescription: `Failed to swap ${nativeToken?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }

            if (
                method.name === 'swapExactTokensForTokens' &&
                parameters?.path &&
                parameters?.amountIn &&
                parameters?.amountOutMin
            ) {
                const tokenIn = await this.Hub.getFungibleToken(first(parameters.path) ?? '', {
                    chainId: context.chainId,
                })

                const tokenOut = await this.Hub.getFungibleToken(last(parameters.path) ?? '', {
                    chainId: context.chainId,
                })

                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.amountIn,
                    description: `Swap ${getTokenAmountDescription(parameters.amountIn, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.amountIn,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters.amountOutMin, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
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
                const tokenIn = isSameAddress(parameters.fromToken, DODO_ETH_ADDRESS)
                    ? nativeToken
                    : await this.Hub.getFungibleToken(parameters.fromToken ?? '', { chainId: context.chainId })
                const tokenOut = isSameAddress(parameters.toToken, DODO_ETH_ADDRESS)
                    ? nativeToken
                    : await this.Hub.getFungibleToken(parameters.toToken ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.fromTokenAmount,
                    description: `Swap ${getTokenAmountDescription(parameters.fromTokenAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.fromTokenAmount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters.minReturnAmount, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }

            // DODO: swap DODO for eth
            if (
                method.name === 'dodoSwapV2TokenToETH' &&
                parameters?.fromToken &&
                parameters?.fromTokenAmount &&
                parameters?.minReturnAmount
            ) {
                const tokenIn = await this.Hub.getFungibleToken(parameters.fromToken ?? '', {
                    chainId: context.chainId,
                })
                const tokenOut = nativeToken
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.fromTokenAmount,
                    description: `Swap ${getTokenAmountDescription(parameters.fromTokenAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.fromTokenAmount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters.minReturnAmount, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }

            // Openocean
            if (method.name === 'swap') {
                const _parameters = parameters as
                    | {
                          [key: string]:
                              | {
                                    [key: string]: string
                                }
                              | undefined
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
                    : await this.Hub.getFungibleToken(_parameters[1].srcToken ?? '', { chainId: context.chainId })
                const tokenOut = isSameAddress(_parameters[1].dstToken, OPENOCEAN_ETH_ADDRESS)
                    ? nativeToken
                    : await this.Hub.getFungibleToken(_parameters[1].dstToken ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: _parameters[1].amount,
                    description: `Swap ${getTokenAmountDescription(_parameters[1].amount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            _parameters[1].amount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(_parameters?.[1]?.minReturnAmount, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
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
                    : await this.Hub.getFungibleToken(parameters.inputToken ?? '', { chainId: context.chainId })
                const tokenOut = isSameAddress(parameters.outputToken, ZERO_X_ETH_ADDRESS)
                    ? nativeToken
                    : await this.Hub.getFungibleToken(parameters.outputToken ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.inputTokenAmount,
                    description: `Swap ${getTokenAmountDescription(parameters.inputTokenAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.inputTokenAmount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters.minOutputTokenAmount, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
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
                    : await this.Hub.getFungibleToken(tokenInAddress ?? '', { chainId: context.chainId })
                const tokenOut = isSameAddress(tokenOutAddress, BANCOR_ETH_ADDRESS)
                    ? nativeToken
                    : await this.Hub.getFungibleToken(tokenOutAddress ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters._amount,
                    description: `Swap ${getTokenAmountDescription(parameters._amount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters._amount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters._minReturn, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }
            // Uniswap V3
            if (method.name === 'multicall' && method.parameters?.[0]?.[0]) {
                try {
                    const results = abiCoder.decodeParameters(
                        context.chainId === ChainId.Arbitrum
                            ? UniswapV3MulticallFunctionExactInputSingleABI
                            : UniswapV3MulticallFunctionExactInputABI,
                        method.parameters[0][0].slice(10),
                    ) as {
                        [key: string]: string[]
                    }
                    let path: string
                    let tokenInAddress: string
                    let tokenOutAddress: string
                    let recipient: string
                    let amountIn: string
                    let amountOutMinimum: string
                    if (context.chainId === ChainId.Arbitrum) {
                        const WETH_ADDRESS = getTokenConstant(context.chainId, 'WETH_ADDRESS')

                        ;[tokenInAddress, tokenOutAddress, , recipient, , amountIn, amountOutMinimum] = results['0']

                        if (isSameAddress(WETH_ADDRESS, tokenOutAddress) && isNativeTokenAddress(recipient)) {
                            tokenOutAddress = nativeToken?.address ?? ''
                        }
                    } else {
                        ;[path, tokenOutAddress, , amountIn, amountOutMinimum] = results['0']
                        tokenInAddress = path.slice(0, 42)
                    }

                    const tokenIn = isNativeTokenAddress(tokenInAddress)
                        ? nativeToken
                        : await this.Hub.getFungibleToken(tokenInAddress ?? '', { chainId: context.chainId })
                    const tokenOut = isNativeTokenAddress(tokenOutAddress)
                        ? nativeToken
                        : await this.Hub.getFungibleToken(tokenOutAddress ?? '', { chainId: context.chainId })
                    return {
                        chainId: context.chainId,
                        title: 'Swap Token',
                        tokenInAddress: tokenIn?.address,
                        tokenInAmount: amountIn,
                        description: `Swap ${getTokenAmountDescription(amountIn, tokenIn)} for ${
                            tokenOut?.symbol ?? ''
                        }.`,
                        snackbar: {
                            successfulDescription: `Swap ${getTokenAmountDescription(
                                amountIn,
                                tokenIn,
                            )} for ${getTokenAmountDescription(amountOutMinimum, tokenOut)} successfully.`,
                            failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                        },
                        popup: {
                            method: method.name,
                        },
                    }
                } catch {
                    return {
                        chainId: context.chainId,
                        title: 'Swap Token',
                        description: 'Swap with Uniswap V3',
                        popup: {
                            method: method.name,
                        },
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
                    : await this.Hub.getFungibleToken(tokenInAddress ?? '', { chainId: context.chainId })
                const tokenOut = isSameAddress(tokenOutAddress, ZERO_X_ETH_ADDRESS)
                    ? nativeToken
                    : await this.Hub.getFungibleToken(tokenOutAddress ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.sellAmount,
                    description: `Swap ${getTokenAmountDescription(parameters.sellAmount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.sellAmount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters.minBuyAmount, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }

            // Wrap & Unwrap, e.g. WETH <=> ETH
            if (['withdraw', 'deposit'].includes(method.name ?? '')) {
                const actionName =
                    method.name === 'withdraw'
                        ? i18NextInstance.t('plugin_trader_unwrap')
                        : i18NextInstance.t('plugin_trader_wrap')
                const amount = method.name === 'withdraw' ? parameters?.wad : context.value
                const withdrawToken = await this.Hub.getFungibleToken(context.to ?? '', { chainId: context.chainId })
                const tokenIn = method.name === 'withdraw' ? withdrawToken : nativeToken
                const tokenOut = method.name === 'withdraw' ? nativeToken : withdrawToken
                return {
                    chainId: context.chainId,
                    title: `${actionName} Token`,
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: amount,
                    description: `${actionName} ${getTokenAmountDescription(amount, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `${actionName} ${getTokenAmountDescription(
                            amount,
                            tokenIn,
                        )} for ${getTokenAmountDescription(amount, tokenOut)} successfully.`,
                        failedDescription: `Failed to ${actionName} ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }

            if (
                method.name === 'swapExactTokensForAVAX' &&
                parameters?.amountIn &&
                parameters?.amountOutMin &&
                parameters?.path
            ) {
                const tokenIn = await this.Hub.getFungibleToken(first(parameters.path) ?? '', {
                    chainId: context.chainId,
                })
                const tokenOut = nativeToken

                return {
                    chainId: context.chainId,
                    title: 'Swap Token',
                    tokenInAddress: tokenIn?.address,
                    tokenInAmount: parameters.amountIn,
                    description: `Swap ${getTokenAmountDescription(parameters.amountIn, tokenIn)} for ${
                        tokenOut?.symbol ?? ''
                    }.`,
                    snackbar: {
                        successfulDescription: `Swap ${getTokenAmountDescription(
                            parameters.amountIn,
                            tokenIn,
                        )} for ${getTokenAmountDescription(parameters.amountOutMin, tokenOut)} successfully.`,
                        failedDescription: `Failed to swap ${tokenOut?.symbol ?? ''}.`,
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }
        }
        return
    }
}
