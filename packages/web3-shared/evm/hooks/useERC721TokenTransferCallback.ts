import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useCallback, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { GasConfig, TransactionEventType } from '../types'
import { isSameAddress } from '../utils'
import { useAccount } from './useAccount'

export function useERC721TokenTransferCallback(address?: string) {
    const account = useAccount()
    const erc721Contract = useERC721TokenContract(address)
    const [loading, setLoading] = useState(false)

    const transferCallback = useCallback(
        async (tokenId?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !recipient || !tokenId || !erc721Contract) return

            // error: invalid recipient address
            if (!EthereumAddress.isValid(recipient)) return

            // error: invalid ownership
            const ownerOf = await erc721Contract.methods.ownerOf(tokenId).call()

            if (!ownerOf || !isSameAddress(ownerOf, account)) return

            setLoading(true)
            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await erc721Contract.methods
                    .transferFrom(account, recipient, tokenId)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        setLoading(false)
                        throw error
                    }),
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                erc721Contract.methods
                    .transferFrom(account, recipient, tokenId)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject(error)
                    })
            }).finally(() => setLoading(false))
        },
        [account, erc721Contract],
    )

    return [loading, transferCallback] as const
}
