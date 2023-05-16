import { i18NextInstance } from '@masknet/shared-base'
import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { Web3StateRef } from '../../../apis/Web3StateAPI.js'

export class ERC721Descriptor implements TransactionDescriptor {
    async getContractSymbol(chainId: ChainId, address: string) {
        const connection = Web3StateRef.value.Connection?.getConnection?.({
            chainId,
        })
        const contract = await connection?.getNonFungibleTokenContract(address)
        return contract?.symbol && contract?.symbol.length > 15
            ? `${contract?.symbol.slice(0, 12)}...`
            : contract?.symbol
    }

    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'approve': {
                    if (parameters?.to === undefined || parameters?.tokenId === undefined) break

                    const symbol = await this.getContractSymbol(context.chainId, context.to)

                    return {
                        chainId: context.chainId,
                        title: i18NextInstance.t('plugin_infra_descriptor_nft_approve_title', {
                            action: 'Unlock',
                        }),
                        description: i18NextInstance.t('plugin_infra_descriptor_nft_approve', {
                            symbol,
                            action: 'Unlock',
                        }),
                        snackbar: {
                            successfulDescription: i18NextInstance.t('plugin_infra_descriptor_nft_approve_success', {
                                symbol,
                                action: 'Unlock',
                            }),
                            failedDescription: i18NextInstance.t('plugin_infra_descriptor_nft_approve_fail', {
                                action: 'unlock',
                            }),
                        },
                    }
                }
                case 'setApprovalForAll': {
                    if (parameters?.operator === undefined || parameters?.approved === undefined) break

                    const action = parameters?.approved === false ? 'Revoke' : 'Unlock'
                    const symbol = await this.getContractSymbol(context.chainId, context.to)

                    return {
                        chainId: context.chainId,
                        title: i18NextInstance.t('plugin_infra_descriptor_nft_approve_title', {
                            action,
                        }),
                        description: i18NextInstance.t('plugin_infra_descriptor_nft_approve', {
                            symbol,
                            action,
                        }),
                        snackbar: {
                            successfulDescription:
                                parameters?.approved === false
                                    ? i18NextInstance.t('plugin_infra_descriptor_nft_revoke_success', {
                                          symbol,
                                          action,
                                      })
                                    : i18NextInstance.t('plugin_infra_descriptor_nft_approve_success', {
                                          symbol,
                                          action,
                                      }),
                            failedDescription: i18NextInstance.t('plugin_infra_descriptor_nft_approve_fail', {
                                action: action.toLowerCase(),
                            }),
                        },
                    }
                }
                case 'transferFrom':
                case 'safeTransferFrom': {
                    if (!parameters?.tokenId) return
                    const symbol = await this.getContractSymbol(context.chainId, context.to)
                    return {
                        chainId: context.chainId,
                        title: i18NextInstance.t('plugin_infra_descriptor_nft_transfer_title'),
                        description: i18NextInstance.t('plugin_infra_descriptor_nft_transfer', { symbol }),
                        snackbar: {
                            successfulDescription: i18NextInstance.t('plugin_infra_descriptor_nft_transfer_success', {
                                symbol,
                            }),
                            failedDescription: i18NextInstance.t('plugin_infra_descriptor_nft_transfer_fail'),
                        },
                    }
                }
                default:
                    return
            }
        }

        return
    }
}
