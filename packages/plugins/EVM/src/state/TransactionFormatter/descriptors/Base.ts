import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'

export class BaseTransactionDescriptor implements TransactionDescriptor {
    compute(context: Web3Plugin.TransactionContext<ChainId, string | undefined>) {
        return Promise.resolve({
            title: context.name ?? 'Contract Interaction',
            description: `${
                context.value
                    ? getTokenAmountDescription(
                          context.value as string | undefined,
                          createNativeToken(context.chainId),
                          true,
                      )
                    : '-'
            }`,
        })
    }
}
