import { Airdrop } from '@masknet/web3-providers'
import { isSameAddress, type TransactionContext } from '@masknet/web3-shared-base'
import { getITOConstants, type ChainId, type TransactionParameter } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'
import { Web3StateRef } from '../../../apis/Web3StateAPI.js'

export class AirdropDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        const { ITO2_CONTRACT_ADDRESS } = getITOConstants(context.chainId)
        if (!context.methods?.length || isSameAddress(context.to, ITO2_CONTRACT_ADDRESS)) return

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'claim':
                    const hub = Web3StateRef.value.Hub?.getHub?.({
                        chainId: context.chainId,
                    })
                    const result = parameters?._eventIndex
                        ? await Airdrop.getPoolInfo(context.chainId, parameters._eventIndex)
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
