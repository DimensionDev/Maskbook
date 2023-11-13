import type { AbiItem } from 'web3-utils'
import { type FungibleToken, scale10, formatBalance } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType, decodeEvents } from '@masknet/web3-shared-evm'
import { EVMContractReadonly } from '../../apis/ContractReadonlyAPI.js'
import { BaseDescriptor } from './descriptors/Base.js'

export function getTokenAmountDescription(amount = '0', token?: FungibleToken<ChainId, SchemaType>) {
    const value =
        scale10(1, 9 + (token?.decimals ?? 18)).isGreaterThanOrEqualTo(amount) ?
            formatBalance(amount, token?.decimals)
        :   'infinite'

    return `${value} ${token?.symbol?.trim()}`
}

export class DescriptorWithTransactionDecodedReceipt extends BaseDescriptor {
    async getReceipt(
        chainId: ChainId,
        contractAddress: string | undefined,
        abi: AbiItem[] | undefined,
        hash: string | undefined,
    ) {
        if (!hash || !contractAddress || !abi) return

        const receipt = await this.Web3.getTransactionReceipt(hash, { chainId })
        if (!receipt) return

        const contract = EVMContractReadonly.getWeb3Contract(contractAddress, abi)
        if (!contract) return

        return decodeEvents(contract.options.jsonInterface, receipt.logs)
    }
}
