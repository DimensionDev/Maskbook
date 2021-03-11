import { useCallback } from 'react'
import type { TransactionReceipt } from '@ethersproject/providers'
import Services from '../../../extension/service'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import type { AirdropPacket } from '../apis'
import { useAirdropContract } from '../contracts/useAirdropContract'
import { StageType } from '../../../web3/types'

export function useClaimCallback(packet?: AirdropPacket) {
    const account = useAccount()
    const AirdropContract = useAirdropContract()

    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!AirdropContract || !packet) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { index, amount, proof } = packet

        // pre-step: start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: merkle proof
        try {
            const { available } = await AirdropContract.check(index, account, amount, proof)
            if (!available) {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error: new Error('You have not got any reward.'),
                })
                return
            }
        } catch (e) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to claim the reward.'),
            })
            return
        }

        // step 2-1: estimate gas
        const estimatedGas = await AirdropContract.estimateGas
            .claim(index, packet.amount, proof)
            .catch((error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const onSucceed = (no: number, receipt: TransactionReceipt) => {
                setClaimState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            }
            const onFailed = (error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            const transaction = await AirdropContract.claim(index, packet.amount, proof, {
                gasLimit: estimatedGas,
            })

            for await (const stage of Services.Ethereum.watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.CONFIRMATION:
                        onSucceed(stage.no, stage.receipt)
                        break
                    case StageType.RECEIPT:
                        onSucceed(0, stage.receipt)
                        break
                    case StageType.ERROR:
                        onFailed(stage.error)
                        break
                }
            }
        })
    }, [AirdropContract, account, packet])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
