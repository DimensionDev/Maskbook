import { FungibleToken, scale10, formatBalance } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { decodeEvents, createContract } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../settings'
import BigNumber from 'bignumber.js'
import type { AbiItem } from 'web3-utils'

export function getTokenAmountDescription(amount = '0', token?: FungibleToken<ChainId, SchemaType>) {
    const value = scale10(1, 9 + (token?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
        ? formatBalance(amount, token?.decimals ?? 0, 4)
        : 'infinite'

    if (value !== 'infinite' && new BigNumber(value).isLessThan(new BigNumber('0.000001'))) {
        return `<0.000001 ${token?.symbol?.trim()}`
    }
    return `${value} ${token?.symbol?.trim()}`
}

export class DescriptorWithTransactionDecodedReceipt {
    async getReceipt(
        chainId: ChainId,
        contractAddress: string | undefined,
        abi: AbiItem[] | undefined,
        hash: string | undefined,
    ) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })

        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId,
        })

        if (!connection || !web3 || !hash || !contractAddress || !abi) return

        const receipt = await connection.getTransactionReceipt(hash)

        if (!receipt) return

        const contract = createContract(web3, contractAddress, abi)

        if (!contract) return

        return decodeEvents(web3, contract.options.jsonInterface, receipt)
    }
}
