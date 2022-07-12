import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import type { TransactionDescriptor } from '../types'

export class ERC721Descriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        if (!context.methods?.length) return

        for (const method of context.methods) {
            const parameters = method.parameters

            switch (method.name) {
                case 'approve':
                    if (parameters?.to === undefined || parameters?.tokenId === undefined) break

                    const connection = await Web3StateSettings.value.Connection?.getConnection?.({
                        chainId: context.chainId,
                    })
                    const contract = await connection?.getNonFungibleTokenContract(context.to)

                    return {
                        chainId: context.chainId,
                        title: `Unlock ${contract?.symbol ?? 'token'} contract`,
                        description: `Unlock ${contract?.symbol ?? 'token'} contract`,
                        successfulDescription: `${contract?.symbol ?? 'token'} is unlocked successfully.`,
                    }
                case 'setApprovalForAll':
                    if (parameters?.operator === undefined || parameters?.approved === undefined) break
                    return {
                        chainId: context.chainId,
                        title: parameters?.approved === false ? 'Revoke' : 'Unlock',
                        description: `${
                            parameters?.approved === false ? 'Revoke the approval for' : 'Unlock'
                        } the token.`,
                        successfulDescription: 'Revoke the approval successfully.',
                    }

                default:
                    return
            }
        }

        return
    }
}
