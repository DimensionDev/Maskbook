import {
    useAccount,
    useChainId,
    useGasPrice,
    useNonce,
    useTransactionState,
    TransactionStateType,
    TransactionEventType,
} from '@masknet/web3-shared'
import type { TransactionReceipt } from 'web3-core'
import { useNftRedPacketContract } from './useNftRedPacketContract'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import { useCallback } from 'react'

export function useClaimNftRedpacketCallback(id: string, signedMsg: string) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const chainId = useChainId()
    const nftRedPacketContract = useNftRedPacketContract()
    const [claimState, setClaimState] = useTransactionState()
    const claimCallback = useCallback(async () => {
        if (!nftRedPacketContract || !id || !signedMsg || !account) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        type MethodParameters = Parameters<NftRedPacket['methods']['claim']>

        const params: MethodParameters = [id, signedMsg, account]

        const config = {
            from: account,
            gas: await nftRedPacketContract.methods
                .claim(...params)
                .estimateGas({ from: account })
                .catch((error) => {
                    setClaimState({ type: TransactionStateType.FAILED, error })
                    throw error
                }),
            gasPrice,
            nonce,
            chainId,
        }

        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = nftRedPacketContract.methods.claim(...params).send(config as NonPayableTx)
            promiEvent.on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                setClaimState({
                    type: TransactionStateType.WAIT_FOR_CONFIRMING,
                    hash,
                })
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setClaimState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
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
    }, [id, signedMsg, account, chainId, nonce, gasPrice])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
