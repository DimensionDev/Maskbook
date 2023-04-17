import { i18NextInstance } from '@masknet/shared-base'
import { type TransactionContext, isZero, leftShift, pow10, isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, type TransactionParameter, SchemaType, ProviderType } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import { Web3StateSettings } from '../../../settings/index.js'
import { BigNumber } from 'bignumber.js'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })
        const hub = Web3StateSettings.value.Hub?.getHub?.({
            chainId: context.chainId,
        })

        const providerType = Web3StateSettings.value.Provider?.providerType?.getCurrentValue()

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'approve':
                    if (parameters?.spender === undefined || parameters?.value === undefined) break
                    const token = await hub?.getFungibleToken?.(context.to ?? '', { chainId: context.chainId })

                    if (providerType === ProviderType.MetaMask) {
                        const spenders = await hub?.getFungibleTokenSpenders?.(context.chainId, context.from)

                        const spender = spenders?.find(
                            (x) =>
                                isSameAddress(x.address, parameters?.spender) &&
                                isSameAddress(x.tokenInfo.address, context.to),
                        )

                        const spendingCap = new BigNumber(spender?.amount ?? 0).toString()

                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: i18NextInstance.t('plugin_infra_descriptor_token_set_spending_cap_title'),
                            description: i18NextInstance.t('plugin_infra_descriptor_token_set_spending_cap', {
                                symbol: token?.symbol ?? 'token',
                            }),
                            snackbar: {
                                successfulDescription: isZero(spendingCap)
                                    ? i18NextInstance.t('plugin_infra_descriptor_token_revoke_success')
                                    : i18NextInstance.t('plugin_infra_descriptor_token_approve_success', {
                                          tokenAmountDescription: getTokenAmountDescription(spendingCap, token),
                                      }),
                                successfulTitle: isZero(spendingCap)
                                    ? i18NextInstance.t('plugin_infra_descriptor_token_revoke_title')
                                    : i18NextInstance.t('plugin_infra_descriptor_token_approve_title'),
                                failedDescription: i18NextInstance.t(
                                    'plugin_infra_descriptor_token_set_spending_cap_fail',
                                ),
                                failedTitle: isZero(spendingCap)
                                    ? i18NextInstance.t('plugin_infra_descriptor_token_revoke_fail')
                                    : i18NextInstance.t('plugin_infra_descriptor_token_fail'),
                            },
                        }
                    }

                    if (isZero(parameters.value)) {
                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: i18NextInstance.t('plugin_infra_descriptor_token_revoke_title'),
                            description: i18NextInstance.t('plugin_infra_descriptor_token_revoke', {
                                symbol: token?.symbol ?? 'token',
                            }),
                            popup: {
                                tokenDescription: token?.symbol ?? 'token',
                            },
                            snackbar: {
                                successfulDescription: i18NextInstance.t(
                                    'plugin_infra_descriptor_token_revoke_success',
                                ),
                                failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_revoke_fail'),
                            },
                        }
                    }

                    return {
                        chainId: context.chainId,
                        title: i18NextInstance.t('plugin_infra_descriptor_token_approve_title'),
                        tokenInAddress: token?.address,
                        tokenInAmount: parameters?.value,
                        description: i18NextInstance.t('plugin_infra_descriptor_token_approve', {
                            tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                        }),
                        popup: {
                            tokenDescription: leftShift(parameters?.value, token?.decimals).gt(pow10(9))
                                ? i18NextInstance.t('popups_wallet_token_infinite_unlock')
                                : undefined,
                        },
                        snackbar: {
                            successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_approve_success', {
                                tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                            }),
                            failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_fail'),
                        },
                    }
            }

            if (
                (name === 'transfer' || name === 'transferFrom') &&
                parameters?.to &&
                parameters.value &&
                !parameters.tokenId
            ) {
                const schemaType = await connection?.getSchemaType(context.to ?? '', { chainId: context.chainId })
                if (schemaType === SchemaType.ERC721) return
                const token = await hub?.getFungibleToken?.(context.to ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters?.value,
                    title: i18NextInstance.t('plugin_infra_descriptor_token_transfer_title'),
                    description: i18NextInstance.t('plugin_infra_descriptor_token_transfer', {
                        tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                    }),
                    snackbar: {
                        successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_transfer_success', {
                            tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                        }),
                        failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_transfer_fail'),
                    },
                }
            }
        }

        return
    }
}
