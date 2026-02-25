import { type FungibleToken, scale10, formatBalance } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType, decodeEvents } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './descriptors/Base.js'
import type { Abi } from 'viem'

export function getTokenAmountDescription(amount: string | bigint = '0', token?: FungibleToken<ChainId, SchemaType>) {
    amount = String(amount)
    const value =
        scale10(1, 9 + (token?.decimals ?? 18)).isGreaterThanOrEqualTo(amount) ?
            formatBalance(amount, token?.decimals)
        :   'infinite'

    return `${value} ${token?.symbol?.trim()}`
}

export class DescriptorWithTransactionDecodedReceipt extends BaseDescriptor {
    protected async getReceipt<abi extends Abi>(
        chainId: ChainId,
        contractAddress: string | undefined,
        abi: abi | undefined,
        hash: string | undefined,
    ) {
        if (!hash || !contractAddress || !abi) return

        const receipt = await this.Web3.getTransactionReceipt(hash, { chainId })
        if (!receipt) return

        return decodeEvents(abi, receipt.logs)
    }
}
