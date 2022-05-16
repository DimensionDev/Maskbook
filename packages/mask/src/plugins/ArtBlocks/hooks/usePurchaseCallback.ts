import type { PayableTx } from '@masknet/web3-contracts/types/types'
import {
    EthereumTokenType,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useChainId,
    useTransactionState,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(projectId: string, amount: string, tokenType?: number) {
    const account = useAccount()
    const chainId = useChainId()

    const genArt721MinterContract = useArtBlocksContract()
    const [purchaseState, setPurchaseState] = useTransactionState()

    const purchaseCallback = useCallback(async () => {
        if (!genArt721MinterContract) {
            setPurchaseState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setPurchaseState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const value = new BigNumber(tokenType === EthereumTokenType.Native ? amount : 0).toFixed()
        const config = {
            from: account,
            value,
            gas: await genArt721MinterContract.methods
                .purchase(projectId)
                .estimateGas({
                    from: account,
                    value,
                })
                .catch((error) => {
                    setPurchaseState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            genArt721MinterContract.methods
                .purchase(projectId)
                .send(config as PayableTx)
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setPurchaseState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setPurchaseState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setPurchaseState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, chainId, genArt721MinterContract, tokenType])

    const resetCallback = useCallback(() => {
        setPurchaseState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [purchaseState, purchaseCallback, resetCallback] as const
}
