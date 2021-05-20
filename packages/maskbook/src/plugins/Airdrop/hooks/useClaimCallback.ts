import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import type { NonPayableTx } from '@dimensiondev/contracts/types/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { TransactionEventType } from '../../../web3/types'
import type { AirdropPacket } from '../apis'
import { useAirdropContract } from '../contracts/useAirdropContract'
import Services from '../../../extension/service'

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

        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // merkle proof
        try {
            const { available } = await AirdropContract.methods.check(index, account, amount, proof).call({
                from: account,
            })
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

        // the claim amount will be set up later if the Merkle proof success
        const claimParams: Parameters<typeof AirdropContract['methods']['claim']> = [index, packet.amount, proof]

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: AirdropContract.options.address,
            data: AirdropContract.methods.claim(...claimParams).encodeABI(),
        }).catch((error) => {
            setClaimState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction
        return new Promise<void>((resolve, reject) => {
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
            const promiEvent = AirdropContract.methods.claim(...claimParams).send(config as NonPayableTx)

            promiEvent
                .on(TransactionEventType.ERROR, onFailed)
                .on(TransactionEventType.RECEIPT, (receipt) => onSucceed(0, receipt))
                .on(TransactionEventType.CONFIRMATION, onSucceed)
        })
    }, [AirdropContract, account, packet])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
