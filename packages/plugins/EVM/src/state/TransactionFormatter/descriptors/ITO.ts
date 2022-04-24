import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { i18NextInstance } from '@masknet/shared-base'
import { ChainId, formatBalance, getITOConstants, isSameAddress } from '@masknet/web3-shared-evm'
import { createConnection } from '../../Protocol/connection'
import type { TransactionDescriptor } from '../types'

export class ITODescriptor implements TransactionDescriptor {
    async compute(context: Web3Plugin.TransactionContext<ChainId>) {
        const { ITO2_CONTRACT_ADDRESS } = getITOConstants(context.chainId)
        if (!isSameAddress(context.to, ITO2_CONTRACT_ADDRESS)) return

        const connection = createConnection(context.chainId, context.from)
        const token = await connection.getFungileToken(context.parameters?._token_addr ?? '')
        const amount = formatBalance(context.parameters?._total_tokens, token.decimals)

        return Promise.resolve({
            title: 'Create ITO Packet',
            description:
                token && amount
                    ? i18NextInstance.t('plugin_ito_transaction_dialog_summary', {
                          amount,
                          symbol: token.symbol,
                      })
                    : i18NextInstance.t('plugin_ito_transaction_dialog_summary_with_no_token'),
        })
    }
}
