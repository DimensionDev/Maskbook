import { i18NextInstance } from '@masknet/shared-base'
import { TransactionContext, isSameAddress, formatBalance } from '@masknet/web3-shared-base'
import { ChainId, getITOConstants } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import type { TransactionDescriptor } from '../types'

export class ITODescriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        const { ITO2_CONTRACT_ADDRESS } = getITOConstants(context.chainId)
        if (!isSameAddress(context.to, ITO2_CONTRACT_ADDRESS)) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
            account: context.from,
        })
        const token = await connection?.getFungibleToken((context.parameters?._token_addr as string) ?? '')
        const amount = formatBalance(context.parameters?._total_tokens as string, token?.decimals)

        return {
            chainId: context.chainId,
            title: 'Create ITO Packet',
            description:
                token && amount
                    ? i18NextInstance.t('plugin_ito_transaction_dialog_summary', {
                          amount,
                          symbol: token.symbol,
                      })
                    : i18NextInstance.t('plugin_ito_transaction_dialog_summary_with_no_token'),
        }
    }
}
