import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import type { TransactionDescriptor } from '../types'

export class ERC721Descriptor implements TransactionDescriptor {
    async getContractSymbol(chainId: ChainId, address: string) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const contract = await connection?.getNonFungibleTokenContract(address)
        return contract?.symbol
    }

    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        if (!context.methods?.length) return

        for (const method of context.methods) {
            const parameters = method.parameters

            switch (method.name) {
                case 'approve': {
                    if (parameters?.to === undefined || parameters?.tokenId === undefined) break

                    const symbol = await this.getContractSymbol(context.chainId, context.to)

                    return {
                        chainId: context.chainId,
                        title: `Unlock ${symbol ?? 'token'} contract`,
                        description: `Unlock ${symbol ?? 'token'} contract`,
                        successfulDescription: `${symbol ?? 'token'} is unlocked successfully.`,
                    }
                }
                case 'setApprovalForAll': {
                    if (parameters?.operator === undefined || parameters?.approved === undefined) break

                    const action = parameters?.approved === false ? 'Revoke' : 'Unlock'
                    const symbol = await this.getContractSymbol(context.chainId, context.to)

                    return {
                        chainId: context.chainId,
                        title: `${action} ${symbol ?? 'token'} contract`,
                        description: `${action} ${symbol ?? 'token'} contract`,
                        successfulDescription: `${action} the approval successfully.`,
                    }
                }

                default:
                    return
            }
        }

        return
    }
}
