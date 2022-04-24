import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'

export class BaseTransactionDescriptor implements TransactionDescriptor {
    async compute(context: Web3Plugin.TransactionContext<ChainId, string | undefined>) {
        const connection = Web3StateSettings.value.Protocol?.getConnection?.({
            chainId: context.chainId,
        })

        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const nativeToken = await connection?.getFungileToken(NATIVE_TOKEN_ADDRESS!)

        return Promise.resolve({
            title: context.name ?? 'Contract Interaction',
            description: `${
                context.value ? getTokenAmountDescription(context.value as string | undefined, nativeToken, true) : '-'
            }`,
        })
    }
}
