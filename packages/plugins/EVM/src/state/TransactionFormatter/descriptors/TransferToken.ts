import type { Web3Plugin } from '@masknet/plugin-infra/src/entry-web3'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils'

export class TransferTokenDescriptor {
    compute(context: Web3Plugin.TransactionContext<ChainId>) {
        return Promise.resolve({
            title: 'Transfer',
            description: `Send token -${getTokenAmountDescription(context.value, createNativeToken(context.chainId))}`,
        })
    }
}
