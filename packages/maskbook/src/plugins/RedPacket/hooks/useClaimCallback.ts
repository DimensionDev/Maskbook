import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { RedPacketRPC } from '../messages'
import Services from '../../../extension/service'

export function useClaimCallback(from: string, id?: string, password?: string) {
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
        const config = await Services.Ethereum.composeTransaction({
            from,
            to: redPacketContract.options.address,
            data: redPacketContract.methods.claim(...params).encodeABI(),
        }).catch((error) => {
            setClaimState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            const onSucceed = (hash: string) => {
                setClaimState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            }
            const onFailed = (error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            redPacketContract.methods.claim(...params).send(config as Tx, async (error, hash) => {
                if (hash) onSucceed(hash)
                // claim by server
                else if (error?.message.includes('insufficient funds for gas')) {
                    RedPacketRPC.claimRedPacket(from, id, password)
                        .then(({ claim_transaction_hash }) => onSucceed(claim_transaction_hash))
                        .catch(onFailed)
                } else if (error) onFailed(error)
            })
        })
    }, [id, password, from, redPacketContract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
