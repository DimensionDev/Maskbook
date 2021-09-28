import { useCallback, useMemo } from 'react'
import Web3Utils from 'web3-utils'
import { useAsync } from 'react-use'
import { useRedPacketContract } from './useRedPacketContract'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import {
    useTransactionState,
    TransactionStateType,
    TransactionEventType,
    useSpeedUpTransaction,
    useBlockNumber,
} from '@masknet/web3-shared'
import type { TransactionReceipt } from 'web3-core'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'

export function useClaimCallback(version: number, from: string, id: string, password?: string) {
    const [claimState, setClaimState] = useTransactionState()
    const redPacketContract = useRedPacketContract(version)

    //#region handle transaction speed up
    const _blockNumber = useBlockNumber()
    const originalBlockNumber = useMemo(() => _blockNumber, [])

    const checkSpeedUpTx = useCallback(
        (decodedInputParam: { id: string }) => {
            return decodedInputParam.id === id
        },
        [id],
    )

    const speedUpTx = useSpeedUpTransaction(
        claimState,
        from,
        redPacketContract?.options,
        'claim',
        checkSpeedUpTx,
        originalBlockNumber,
    )

    useAsync(async () => {
        if (!speedUpTx) return

        setClaimState({
            type: TransactionStateType.CONFIRMED,
            // `receipt` and `no` is not needed here.
            no: 0,
            receipt: {} as unknown as TransactionReceipt,
        })
    }, [speedUpTx])
    //#endregion

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

        // note: despite the method params type of V1 and V2 is the same,
        //  but it is more understandable to declare respectively
        const claim =
            version === 4
                ? () => (redPacketContract as HappyRedPacketV4).methods.claim(id, password, from)
                : () =>
                      (redPacketContract as HappyRedPacketV1).methods.claim(
                          id,
                          password as string,
                          from,
                          Web3Utils.sha3(from)!,
                      )

        // estimate gas and compose transaction
        const config = {
            from,
            gas: await claim()
                .estimateGas({
                    from,
                })
                .catch((error) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
        }

        // step 2-1: blocking
        return new Promise<void>((resolve, reject) => {
            const promiEvent = claim().send(config as NonPayableTx)

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
    }, [id, password, from, redPacketContract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
