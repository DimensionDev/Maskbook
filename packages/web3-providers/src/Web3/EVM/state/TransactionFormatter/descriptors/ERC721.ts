import type { TransactionContext } from '@masknet/web3-shared-base'
import type { AbiFunctionToObjectMapped, ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { BaseDescriptor } from './Base.js'
import type { ERC721Abi } from '@masknet/web3-contracts/types/ERC721.js'

export class ERC721Descriptor extends BaseDescriptor {
    async getContractSymbol(chainId: ChainId, address: string) {
        const contract = await this.Web3.getNonFungibleTokenContract(address, undefined, { chainId })
        return contract.symbol && contract.symbol.length > 15 ? `${contract.symbol.slice(0, 12)}...` : contract.symbol
    }

    override async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        if (!context.methods?.length) return

        for (const { name, parameters: _parameters } of context.methods) {
            switch (name) {
                case 'approve': {
                    const schemaType = await this.Web3.getSchemaType(context.to)
                    if (_parameters?.to === undefined || _parameters.tokenId === undefined || !schemaType) break

                    const symbol = (await this.getContractSymbol(context.chainId, context.to)) || ''

                    return {
                        chainId: context.chainId,
                        title: 'Unlock NFT Contract',
                        description: { key: 'Unlock {symbol} NFT contract.', symbol },
                        snackbar: {
                            successfulDescription: { key: '{symbol} NFT contract unlocked.', symbol },
                            failedDescription: 'Failed to unlock NFT contract.',
                        },
                        popup: {
                            method: name,
                        },
                    }
                }
                case 'setApprovalForAll': {
                    if (_parameters?.operator === undefined || _parameters.approved === undefined) break
                    const parameters = _parameters as AbiFunctionToObjectMapped<
                        ERC721Abi,
                        'setApprovalForAll',
                        'inputs'
                    >

                    const action = parameters.approved ? 'Unlock' : 'Revoke'
                    const symbol = (await this.getContractSymbol(context.chainId, context.to)) || ''

                    return {
                        chainId: context.chainId,
                        title: { key: '{action} NFT contract', action },
                        description: { key: '{action} {symbol} NFT contract.', action, symbol },
                        snackbar: {
                            successfulDescription:
                                parameters.approved ?
                                    { key: '{action} {symbol} NFT contract successfully.', action, symbol }
                                :   { key: '{action} {symbol} approval successfully.', action, symbol },
                            failedDescription: {
                                key: 'Failed to {action} NFT contract.',
                                action: action.toLowerCase(),
                            },
                        },
                        popup: {
                            erc721Spender:
                                typeof parameters.operator === 'string' && action === 'Unlock' ?
                                    parameters.operator
                                :   undefined,
                            method: name,
                        },
                    }
                }
                case 'transferFrom':
                case 'safeTransferFrom': {
                    if (!_parameters?.tokenId) return
                    const parameters = _parameters as AbiFunctionToObjectMapped<
                        ERC721Abi,
                        'transferFrom' | 'safeTransferFrom',
                        'inputs'
                    >
                    const symbol = (await this.getContractSymbol(context.chainId, context.to)) || ''
                    return {
                        chainId: context.chainId,
                        title: 'Transfer NFT',
                        description: { key: 'Transfer {symbol} NFT.', symbol },
                        snackbar: {
                            successfulDescription: { key: '{symbol} NFT transferred.', symbol },
                            failedDescription: 'Failed to transfer NFT.',
                        },
                        popup: {
                            method: name,
                            tokenId: String(parameters.tokenId),
                        },
                    }
                }
                default:
                    return
            }
        }

        return
    }
}
