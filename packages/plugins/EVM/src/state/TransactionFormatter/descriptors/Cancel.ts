import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'

export class CancelDescriptor {
    compute(context: Web3Plugin.TransactionContext<ChainId>) {
        return Promise.resolve({
            title: 'Cancel Trasnaction',
        })
    }
}
