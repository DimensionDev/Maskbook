import { i18NextInstance } from '@masknet/shared-base'
import { TransactionContext, isZero, leftShift, pow10 } from '@masknet/web3-shared-base'
import { ChainId, TransactionParameter, SchemaType } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import { Web3StateSettings } from '../../../settings/index.js'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        if (!context.methods?.length) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })
        for (const method of context.methods) {
            const parameters = method.parameters

            switch (method.name) {
                case 'approve':
                    if (parameters?.spender === undefined || parameters?.value === undefined) break
                    const token = await connection?.getFungibleToken(context.to ?? '', {
                        chainId: context.chainId,
                    })
                    if (isZero(parameters?.value)) {
                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: i18NextInstance.t('plugin_infra_descriptor_token_revoke_title'),
                            description: i18NextInstance.t('plugin_infra_descriptor_token_revoke', {
                                symbol: token?.symbol ?? 'token',
                            }),
                            tokenDescription: token?.symbol ?? 'token',
                            successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_revoke_success'),
                            failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_revoke_fail'),
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
                        tokenDescription: leftShift(parameters?.value, token?.decimals).gt(pow10(9))
                            ? i18NextInstance.t('popups_wallet_token_infinite_unlock')
                            : undefined,
                        successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_approve_success', {
                            tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                        }),
                        failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_fail'),
                    }
            }

            if (
                (method.name === 'transfer' || method.name === 'transferFrom') &&
                parameters?.to &&
                parameters?.value &&
                !parameters?.tokenId
            ) {
                const schemaType = await connection?.getSchemaType(context.to ?? '', { chainId: context.chainId })
                if (schemaType === SchemaType.ERC721) return
                const token = await connection?.getFungibleToken(context.to ?? '', {
                    chainId: context.chainId,
                })
                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters?.value,
                    title: i18NextInstance.t('plugin_infra_descriptor_token_transfer_title'),
                    description: i18NextInstance.t('plugin_infra_descriptor_token_transfer', {
                        tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                    }),
                    successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_transfer_success', {
                        tokenAmountDescription: getTokenAmountDescription(parameters?.value, token),
                    }),
                    failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_transfer_fail'),
                }
            }
        }

        return
    }
}
