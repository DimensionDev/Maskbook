import { i18NextInstance } from '@masknet/shared-base'
import type { TransactionContext } from '@masknet/web3-shared-base'
import { getTokenAmountDescription } from '../utils.js'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { Web3StateSettings } from '../../../settings/index.js'

export class SavingsDescriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        if (!context.methods?.length) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        for (const method of context.methods) {
            const parameters = method.parameters

            // Lido
            if (method.name === 'submit' && parameters?._referral) {
                const token = await connection?.getNativeToken({
                    chainId: context.chainId,
                })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: context.value,
                    title: i18NextInstance.t('plugin_infra_descriptor_token_deposit_title'),
                    description: i18NextInstance.t('plugin_infra_descriptor_token_deposit', {
                        tokenAmountDescription: getTokenAmountDescription(context.value, token),
                    }),
                    snackbar: {
                        successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_deposit_success', {
                            tokenAmountDescription: getTokenAmountDescription(context.value, token),
                        }),
                        failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_deposit_fail', {
                            symbol: token?.symbol ?? 'token',
                        }),
                    },
                }
            }

            // Aave
            if (method.name === 'deposit' && parameters?.amount && parameters?.asset) {
                const token = await connection?.getFungibleToken(parameters?.asset, {
                    chainId: context.chainId,
                })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters?.amount,
                    title: i18NextInstance.t('plugin_infra_descriptor_token_deposit_title'),
                    description: i18NextInstance.t('plugin_infra_descriptor_token_deposit', {
                        tokenAmountDescription: getTokenAmountDescription(parameters?.amount, token),
                    }),
                    snackbar: {
                        successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_deposit_success', {
                            tokenAmountDescription: getTokenAmountDescription(parameters?.amount, token),
                        }),
                        failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_deposit_fail', {
                            symbol: token?.symbol ?? 'token',
                        }),
                    },
                }
            }

            if (method.name === 'withdraw' && parameters?.amount && parameters?.asset) {
                const token = await connection?.getFungibleToken(parameters?.asset, {
                    chainId: context.chainId,
                })

                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters?.amount,
                    title: i18NextInstance.t('plugin_infra_descriptor_token_withdraw_title'),
                    description: i18NextInstance.t('plugin_infra_descriptor_token_withdraw', {
                        tokenAmountDescription: getTokenAmountDescription(parameters?.amount, token),
                    }),
                    snackbar: {
                        successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_withdraw_success', {
                            tokenAmountDescription: getTokenAmountDescription(parameters?.amount, token),
                        }),
                        failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_withdraw_fail', {
                            symbol: token?.symbol ?? 'token',
                        }),
                    },
                }
            }
        }

        return
    }
}
