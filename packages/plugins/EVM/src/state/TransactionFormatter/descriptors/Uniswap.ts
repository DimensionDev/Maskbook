import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils'

export class UniswapDescriptor {
    compute(context: Web3Plugin.TransactionContext<ChainId>) {
        return Promise.resolve({
            title: 'Contract Depolyment',
            description: `Contract Deployment ${getTokenAmountDescription(
                context.value,
                createNativeToken(context.chainId),
                true,
            )}`,
        })
    }
}
