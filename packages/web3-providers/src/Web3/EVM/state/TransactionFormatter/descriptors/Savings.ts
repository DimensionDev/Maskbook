import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { BaseDescriptor } from './Base.js'

export class SavingsDescriptor extends BaseDescriptor {
    override async compute(
        context_: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            // Lido
            if (name === 'submit' && parameters?._referral) {
                const token = await this.Web3.getNativeToken({
                    chainId: context.chainId,
                })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token.address,
                    tokenInAmount: context.value,
                    title: 'Deposit token',
                    description: {
                        key: 'Deposit {token} for savings.',
                        token: getTokenAmountDescription(context.value, token),
                    },
                    snackbar: {
                        successfulDescription: {
                            key: '{token} deposited.',
                            token: getTokenAmountDescription(context.value, token),
                        },
                        failedDescription:
                            token.symbol ?
                                { key: 'Failed to deposit {symbol}.', symbol: token.symbol }
                            :   'Failed to deposit token.',
                    },
                    popup: {
                        method: name,
                    },
                }
            }

            // Aave
            if (name === 'deposit' && parameters?.amount && parameters.asset) {
                const token = await this.Hub.getFungibleToken(parameters.asset ?? '', { chainId: context.chainId })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters.amount,
                    title: 'Deposit token',
                    description: {
                        key: 'Deposit {token} for savings.',
                        token: getTokenAmountDescription(parameters.amount, token),
                    },
                    snackbar: {
                        successfulDescription: {
                            key: '{token} deposited.',
                            token: getTokenAmountDescription(parameters.amount, token),
                        },
                        failedDescription: { key: 'Failed to deposit {symbol}.', symbol: token?.symbol ?? 'token' },
                    },
                    popup: {
                        method: name,
                    },
                }
            }

            if (name === 'withdraw' && parameters?.amount && parameters.asset) {
                const token = await this.Hub.getFungibleToken(parameters.asset ?? '', { chainId: context.chainId })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters.amount,
                    title: 'Withdraw token',
                    description: {
                        key: 'Withdraw {token} for savings.',
                        token: getTokenAmountDescription(parameters.amount, token),
                    },
                    snackbar: {
                        successfulDescription: {
                            key: '{token} withdrawn.',
                            token: getTokenAmountDescription(parameters.amount, token),
                        },
                        failedDescription: {
                            key: 'Failed to withdraw {symbol}.',
                            symbol: token?.symbol ?? 'token',
                        },
                    },
                    popup: {
                        method: name,
                    },
                }
            }
        }

        return
    }
}
