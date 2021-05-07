import { useCallback } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { isSameAddress } from '../helpers'
import Services from '../../extension/service'
import type { Tx } from '@dimensiondev/contracts/types/types'

export function useERC721TokenTransferCallback(address: string, tokenId?: string, recipient?: string) {
    const account = useAccount()
    const erc721Contract = useERC721TokenContract(address)
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !tokenId || !erc721Contract) {
            setTransferState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error: invalid recipient address
        if (!EthereumAddress.isValid(recipient)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid recipient address'),
            })
            return
        }

        // error: invalid ownership
        const ownerOf = await erc721Contract.methods.ownerOf(tokenId).call()

        if (!ownerOf || !isSameAddress(ownerOf, account) || isSameAddress(ownerOf, recipient)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid ownership'),
            })
            return
        }

        // start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: erc721Contract.options.address,
            data: erc721Contract.methods.transferFrom(account, recipient, tokenId).encodeABI(),
        }).catch((error) => {
            setTransferState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            erc721Contract.methods.transferFrom(account, recipient, tokenId).send(config as Tx, (error, hash) => {
                if (error) {
                    setTransferState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                } else {
                    setTransferState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                }
            })
        })
    }, [account, tokenId, recipient, erc721Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
