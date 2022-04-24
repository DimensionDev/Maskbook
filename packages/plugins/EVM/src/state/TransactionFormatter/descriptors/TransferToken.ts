import type { Web3Plugin } from '@masknet/plugin-infra/src/entry-web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { createConnection } from '../../Protocol/connection'
import { getTokenAmountDescription } from '../utils'

export class TransferTokenDescriptor {
    compute(context: Web3Plugin.TransactionContext<ChainId>) {
        const connection = createConnection(context.chainId)

        return Promise.resolve({
            title: 'Transfer',
            description: `Send token -${getTokenAmountDescription(
                context.value,
                connection.getFungileToken(context.chainId),
            )}`,
        })
    }
}
