import { useCallback } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { isSameAddress } from '../helpers'
import Services from '../../extension/service'
import { StageType } from '../types'

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

        // error: invalid token
        const ownerOf = await erc721Contract.ownerOf(tokenId)

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
        const estimatedGas = await erc721Contract.estimateGas.transferFrom(account, recipient, tokenId)

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const transaction = await erc721Contract.transferFrom(account, recipient, tokenId, {
                gasLimit: estimatedGas,
            })
            for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.RECEIPT:
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt: stage.type,
                        })
                        break
                    case StageType.CONFIRMATION:
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no: stage.no,
                            receipt: stage.type,
                        })
                        break
                    case StageType.ERROR:
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        break
                }
            }
        })
    }, [account, tokenId, recipient, erc721Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
