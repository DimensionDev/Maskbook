import type { AbiItem } from 'web3-utils'
import { Web3 } from '@masknet/web3-providers'
import { type FungibleToken, scale10, formatBalance } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { decodeEvents, createContract } from '@masknet/web3-shared-evm'
import { Web3StateRef } from '../../apis/Web3StateAPI.js'

export function getTokenAmountDescription(amount = '0', token?: FungibleToken<ChainId, SchemaType>) {
    const value = scale10(1, 9 + (token?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
        ? formatBalance(amount, token?.decimals)
        : 'infinite'

    return `${value} ${token?.symbol?.trim()}`
}

export class DescriptorWithTransactionDecodedReceipt {
    async getReceipt(
        chainId: ChainId,
        contractAddress: string | undefined,
        abi: AbiItem[] | undefined,
        hash: string | undefined,
    ) {
        const connection = Web3StateRef.value.Connection?.getConnection?.({
            chainId,
        })

        const web3 = Web3.getWeb3(chainId)

        if (!connection || !web3 || !hash || !contractAddress || !abi) return

        const receipt = await connection.getTransactionReceipt(hash)

        if (!receipt) return

        const contract = createContract(web3, contractAddress, abi)

        if (!contract) return

        return decodeEvents(web3, contract.options.jsonInterface, receipt)
    }
}
