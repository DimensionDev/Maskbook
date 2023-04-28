import { AirDrop } from '@masknet/web3-providers'
import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'
import { getTokenAmountDescription } from '../utils.js'

export class AirDropDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'claim':
                    const hub = Web3StateSettings.value.Hub?.getHub?.({
                        chainId: context.chainId,
                    })
                    const result = parameters?._eventIndex
                        ? await AirDrop.getPoolInfo(context.chainId, parameters._eventIndex)
                        : undefined
                    const token = result?.token
                        ? await hub?.getFungibleToken?.(result.token, { chainId: context.chainId })
                        : undefined
                    return {
                        chainId: context.chainId,
                        title: 'Claim your Airdrop',
                        description: 'Transaction submitted.',
                        snackbar: {
                            successfulDescription: `${getTokenAmountDescription(
                                parameters?._amount,
                                token,
                            )} were successfully claimed`,
                            failedDescription: 'Transaction was Rejected!',
                        },
                    }
            }
        }
        return
    }
}
