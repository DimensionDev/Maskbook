import type { AbiItem } from 'web3-utils'
import { i18NextInstance } from '@masknet/shared-base'
import { TransactionContext, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, getITOConstants, TransactionParameter } from '@masknet/web3-shared-evm'
import ITO_ABI from '@masknet/web3-contracts/abis/ITO2.json'
import { Web3StateSettings } from '../../../settings/index.js'
import type { TransactionDescriptor } from '../types.js'
import { DescriptorWithTransactionDecodedReceipt, getTokenAmountDescription } from '../utils.js'

export class ITODescriptor extends DescriptorWithTransactionDecodedReceipt implements TransactionDescriptor {
    async getClaimTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const events = await this.getReceipt(chainId, contractAddress, ITO_ABI as AbiItem[], hash)

        const { to_value, token_address, to_address } = (events?.ClaimSuccess.returnValues ?? {}) as {
            to_value: string
            token_address: string
            to_address: string
        }

        if (!token_address) return

        const token = await connection?.getFungibleToken(token_address ?? to_address ?? '')

        if (!token) return

        return getTokenAmountDescription(to_value, token)
    }
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>

        const { ITO2_CONTRACT_ADDRESS } = getITOConstants(context.chainId)
        if (!isSameAddress(context.to, ITO2_CONTRACT_ADDRESS)) return
        const method = context.methods?.find((x) => ['fill_pool', 'swap', 'claim', 'destruct'].includes(x.name ?? ''))
        if (method?.name === 'fill_pool') {
            const connection = Web3StateSettings.value.Connection?.getConnection?.({
                chainId: context.chainId,
                account: context.from,
            })
            const token = await connection?.getFungibleToken(method.parameters?._token_addr ?? '')

            return {
                chainId: context.chainId,
                tokenInAddress: token?.address,
                tokenInAmount: method?.parameters?._total_tokens,
                title: i18NextInstance.t('plugin_infra_descriptor_ito_create_title'),
                description: i18NextInstance.t('plugin_infra_descriptor_ito_create'),
                snackbar: {
                    successfulDescription: i18NextInstance.t('plugin_infra_descriptor_ito_create_success', {
                        tokenAmountDescription: getTokenAmountDescription(method.parameters?._total_tokens, token),
                    }),
                    failedDescription: i18NextInstance.t('plugin_infra_descriptor_ito_create_fail'),
                },
            }
        } else if (method?.name === 'claim' || method?.name === 'swap') {
            return {
                chainId: context.chainId,
                title: i18NextInstance.t('plugin_infra_descriptor_ito_claim_title'),
                description: i18NextInstance.t('plugin_infra_descriptor_ito_claim'),
                snackbar: {
                    successfulDescription: i18NextInstance.t('plugin_infra_descriptor_ito_claim_success', {
                        tokenAmountDescription: await this.getClaimTokenInfo(
                            context.chainId,
                            ITO2_CONTRACT_ADDRESS,
                            context.hash,
                        ),
                    }),
                    failedDescription: i18NextInstance.t('plugin_infra_descriptor_ito_claim_fail'),
                },
            }
        } else if (method?.name === 'destruct') {
            return {
                chainId: context.chainId,
                title: i18NextInstance.t('plugin_infra_descriptor_ito_refund_title'),
                description: i18NextInstance.t('plugin_infra_descriptor_ito_refund'),
                snackbar: {
                    successfulDescription: i18NextInstance.t('plugin_infra_descriptor_ito_refund_success'),
                    failedDescription: i18NextInstance.t('plugin_infra_descriptor_ito_refund_fail'),
                },
            }
        }
        return
    }
}
