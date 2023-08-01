import { BigNumber } from 'bignumber.js'
import { i18NextInstance } from '@masknet/shared-base'
import { type TransactionContext, isZero, leftShift, pow10, isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    type TransactionParameter,
    SchemaType,
    ProviderType,
    formatEthereumAddress,
} from '@masknet/web3-shared-evm'
import { Web3StateRef } from '../../../apis/Web3StateAPI.js'
import { BaseDescriptor } from './Base.js'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'

export class ERC20Descriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'approve':
                    if (parameters?.spender === undefined || parameters?.value === undefined) break
                    const token = await this.Hub.getFungibleToken(context.to ?? '', { chainId: context.chainId })

                    const revokeTitle = i18NextInstance.t('plugin_infra_descriptor_token_revoke_title')
                    const approveTitle = i18NextInstance.t('plugin_infra_descriptor_token_approve_title')
                    const revokeDescription = i18NextInstance.t('plugin_infra_descriptor_token_revoke', {
                        symbol: token?.symbol ?? 'token',
                    })
                    const approveDescription = i18NextInstance.t('plugin_infra_descriptor_token_approve', {
                        tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                    })
                    const revokeSuccessDescription = i18NextInstance.t('plugin_infra_descriptor_token_revoke_success')
                    const approveSuccessDescription = i18NextInstance.t(
                        'plugin_infra_descriptor_token_approve_success',
                        {
                            tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                        },
                    )
                    const revokeFailedDescription = i18NextInstance.t('plugin_infra_descriptor_token_revoke_fail')
                    const approveFailedDescription = i18NextInstance.t('plugin_infra_descriptor_token_fail')

                    if (Web3StateRef.value.Provider?.providerType?.getCurrentValue() === ProviderType.MetaMask) {
                        const spenders = await this.Hub.getFungibleTokenSpenders(context.chainId, context.from, {
                            chainId: context.chainId,
                        })

                        const spender = spenders?.find(
                            (x) =>
                                isSameAddress(x.address, parameters?.spender) &&
                                isSameAddress(x.tokenInfo.address, context.to),
                        )

                        const spendingCap = new BigNumber(spender?.amount ?? spender?.rawAmount ?? 0).toString()

                        const successfulDescription = isZero(parameters.value)
                            ? isZero(spendingCap)
                                ? revokeSuccessDescription
                                : i18NextInstance.t('plugin_infra_descriptor_token_revoke_but_set_positive_cap', {
                                      tokenAmountDescription: getTokenAmountDescription(spendingCap, token),
                                      spender: spender?.address
                                          ? formatEthereumAddress(spender?.address, 4)
                                          : 'spender',
                                  })
                            : isZero(spendingCap)
                            ? i18NextInstance.t('plugin_infra_descriptor_token_approve_but_set_zero_cap', {
                                  symbol: token?.symbol,
                              })
                            : approveSuccessDescription

                        const successfulTitle =
                            isZero(parameters.value) && !isZero(spendingCap) ? approveTitle : undefined

                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: isZero(parameters.value) ? revokeTitle : approveTitle,
                            description: isZero(parameters.value) ? revokeDescription : approveDescription,
                            snackbar: {
                                successfulDescription,
                                successfulTitle,
                                failedDescription: isZero(parameters.value)
                                    ? revokeFailedDescription
                                    : approveFailedDescription,
                            },
                            popup: {
                                method: name,
                            },
                        }
                    }

                    if (isZero(parameters.value)) {
                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: revokeTitle,
                            description: revokeDescription,
                            popup: {
                                tokenDescription: token?.symbol ?? 'token',
                                method: name,
                            },
                            snackbar: {
                                successfulDescription: revokeSuccessDescription,
                                failedDescription: revokeFailedDescription,
                            },
                        }
                    }

                    return {
                        chainId: context.chainId,
                        title: approveTitle,
                        tokenInAddress: token?.address,
                        tokenInAmount: parameters?.value,
                        description: approveDescription,
                        popup: {
                            tokenDescription: leftShift(parameters?.value, token?.decimals).gt(pow10(9))
                                ? i18NextInstance.t('popups_wallet_token_infinite_unlock')
                                : undefined,
                            method: name,
                        },
                        snackbar: {
                            successfulDescription: approveSuccessDescription,
                            failedDescription: approveFailedDescription,
                        },
                    }
            }

            if (
                (name === 'transfer' || name === 'transferFrom') &&
                parameters?.to &&
                parameters.value &&
                !parameters.tokenId
            ) {
                const schemaType = await this.Web3.getSchemaType(context.to ?? '', { chainId: context.chainId })
                if (schemaType === SchemaType.ERC721) return
                const token = await this.Hub.getFungibleToken(context.to ?? '', { chainId: context.chainId })
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
                    popup: {
                        method: name,
                    },
                }
            }
        }

        return
    }
}
