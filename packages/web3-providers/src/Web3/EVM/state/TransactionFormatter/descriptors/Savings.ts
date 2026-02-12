import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter, AbiFunctionToObjectMapped } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { BaseDescriptor } from './Base.js'
import type { AaveLendingPoolAbi } from '@masknet/web3-contracts/types/AaveLendingPool.js'

export class SavingsDescriptor extends BaseDescriptor {
    override async compute(
        context_: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name, parameters: _parameters } of context.methods) {
            // Lido
            if (name === 'submit' && _parameters?._referral) {
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
            if (name === 'deposit' && _parameters?.amount !== undefined && _parameters.asset) {
                const parameters = _parameters as AbiFunctionToObjectMapped<AaveLendingPoolAbi, 'deposit', 'inputs'>
                const token = await this.Hub.getFungibleToken(parameters.asset ?? '', { chainId: context.chainId })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: String(parameters.amount),
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

            if (name === 'withdraw' && _parameters?.amount !== undefined && _parameters.asset) {
                const parameters = _parameters as AbiFunctionToObjectMapped<AaveLendingPoolAbi, 'withdraw', 'inputs'>
                const token = await this.Hub.getFungibleToken(parameters.asset ?? '', { chainId: context.chainId })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: String(parameters.amount),
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
