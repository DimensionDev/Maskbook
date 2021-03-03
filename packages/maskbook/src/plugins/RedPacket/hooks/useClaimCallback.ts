import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import type { NonPayableTx } from '@dimensiondev/contracts/types/types'
import {
    useTransactionState,
    TransactionStateType,
    TransactionEventType,
    useGasPrice,
    useNonce,
} from '@dimensiondev/web3-shared'
import type { TransactionReceipt } from 'web3-core'

export function useClaimCallback(from: string, id?: string, password?: string) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const [claimState, setClaimState] = useTransactionState()
    const redPacketContract = useRedPacketContract()

    const claimCallback = useCallback(async () => {
        if (!redPacketContract || !id || !password) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const params: Parameters<typeof redPacketContract['methods']['claim']> = [
            id,
            password,
            from,
            Web3Utils.sha3(from)!,
        ]

        // esitimate gas and compose transaction
        const config = {
            from,
            gas: await redPacketContract.methods
                .claim(...params)
                .estimateGas({
                    from,
                })
                .catch((error: any) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
            gasPrice,
            nonce,
        }

        // step 2-1: blocking
        return new Promise<void>((resolve, reject) => {
            const promiEvent = redPacketContract.methods.claim(...params).send(config as NonPayableTx)

            promiEvent.on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                setClaimState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve()
            })

            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                setClaimState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            })
            promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            })
        })
    }, [gasPrice, nonce, id, password, from, redPacketContract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
