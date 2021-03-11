import { useCallback } from 'react'
import { sha256 } from 'ethers/lib/utils'
import type { TransactionRequest } from '@ethersproject/abstract-provider'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { RedPacketRPC } from '../messages'
import Services from '../../../extension/service'
import { StageType } from '../../../web3/types'

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

        // pre-step: start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const transaction: TransactionRequest = {
            from,
            to: redPacketContract.options.address,
        }
        const params: Parameters<typeof redPacketContract['claim']> = [id, password, from, sha256(from)!]

        // step 1: estimate gas
        const estimatedGas = await redPacketContract.estimateGas.claim(...params).catch((error) => {
            setClaimState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // step 2-1: blocking
        return new Promise<string>(async (resolve, reject) => {
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
            const transaction = await redPacketContract.claim(...params)

            for await (const stage of Services.Ethereum.watchTransaction(from, transaction)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        onSucceed(stage.hash)
                        break
                    case StageType.ERROR:
                        if (stage.error.message.includes('insufficient funds for gas'))
                            RedPacketRPC.claimRedPacket(from, id, password).then(({ claim_transaction_hash }) =>
                                onSucceed(claim_transaction_hash),
                            )
                        else onFailed(stage.error)
                        break
                }
            }
        })
    }, [id, password, from, redPacketContract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
