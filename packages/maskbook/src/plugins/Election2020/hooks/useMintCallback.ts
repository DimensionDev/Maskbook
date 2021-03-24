import { useCallback, useEffect, useState } from 'react'
import { useTransactionReceipt } from '../../../web3/hooks/useTransaction'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useElectionTokenContract } from '../contracts/useElectionTokenContract'
import { PluginElection2020 } from '../messages'
import { resolveStateType } from '../pipes'
import type { CANDIDATE_TYPE, US_STATE_TYPE } from '../types'

export function useMintCallback(from: string, stateType: US_STATE_TYPE, candidateType: CANDIDATE_TYPE) {
    const [txHash, setTxHash] = useState('')
    const [mintState, setMintState] = useTransactionState()
    const electionTokenContract = useElectionTokenContract()

    const mintCallback = useCallback(async () => {
        if (!electionTokenContract) {
            setMintState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setMintState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: check remaining
        const remaining = await electionTokenContract.methods.check_availability(resolveStateType(stateType)).call()
        if (Number.parseInt(remaining || '0', 10) <= 0) {
            setMintState({
                type: TransactionStateType.FAILED,
                error: new Error('There is none NTF token left.'),
            })
            return
        }

        // step 2: mint by server
        try {
            const { mint_transaction_hash } = await PluginElection2020.mintElectionPacket(
                from,
                stateType,
                candidateType,
            )
            setTxHash(mint_transaction_hash)
        } catch (error) {
            setMintState({
                type: TransactionStateType.FAILED,
                error,
            })
        }
    }, [from, stateType, candidateType, electionTokenContract])

    const resetCallback = useCallback(() => {
        setMintState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    //#region tracking receipt
    const receipt = useTransactionReceipt(txHash)

    useEffect(() => {
        if (!receipt) return
        if (receipt.status)
            setMintState({
                type: TransactionStateType.CONFIRMED,
                no: 0,
                receipt,
            })
        else
            setMintState({
                type: TransactionStateType.FAILED,
                error: new Error('The contract execution was not successful, check your transaction.'),
            })
    }, [receipt])
    //#endregion

    return [mintState, mintCallback, resetCallback] as const
}
