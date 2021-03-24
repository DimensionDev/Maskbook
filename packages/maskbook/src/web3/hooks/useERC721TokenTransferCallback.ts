import { useCallback } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { isSameAddress } from '../helpers'

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

        // pre-step: start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const estimatedGas = await erc721Contract.methods.transferFrom(account, recipient, tokenId).estimateGas({
            from: account,
            to: erc721Contract.options.address,
        })

        // step 2: blocking
        return new Promise<string>(async (resolve, reject) => {
            erc721Contract.methods.transferFrom(account, recipient, tokenId).send({
                from: account,
                to: erc721Contract.options.address,
                gas: estimatedGas,
            }, (error, hash) => {
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
