import { useCallback } from 'react'
import stringify from 'json-stable-stringify'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import {
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useChainId,
    useTransactionState,
    useITOConstants,
    isSameAddress,
} from '@masknet/web3-shared'
import { useITO_Contract } from './useITO_Contract'
import { checkAvailability } from '../../Worker/apis/checkAvailability'

export function useClaimCallback(pids: string[], contractAddress: string | undefined) {
    const account = useAccount()
    const chainId = useChainId()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const { contract: ITO_Contract } = useITO_Contract(contractAddress)
    const [claimState, setClaimState] = useTransactionState()

    const isV1 = isSameAddress(ITO_CONTRACT_ADDRESS ?? '', contractAddress)
    const claimCallback = useCallback(async () => {
        if (!ITO_Contract || !contractAddress || pids.length === 0) {
            setClaimState({ type: TransactionStateType.UNKNOWN })
            return
        }
        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // check if already claimed
        try {
            const availabilityList = await Promise.all(
                pids.map((pid) => checkAvailability(pid, account, contractAddress, chainId, isV1)),
            )
            const isClaimed = availabilityList.some((availability) => availability.claimed)

            if (isClaimed) {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Already Claimed'),
                })
                return
            }
        } catch {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to check availability.'),
            })
            return
        }

        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await ITO_Contract.methods
                .claim(pids)
                .estimateGas({ from: account })
                .catch((error) => {
                    setClaimState({ type: TransactionStateType.FAILED, error })
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = ITO_Contract.methods.claim(pids).send(config as NonPayableTx)

            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setClaimState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                })
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, chainId, ITO_Contract, stringify(pids), isV1])

    const resetCallback = useCallback(() => {
        setClaimState({ type: TransactionStateType.UNKNOWN })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
