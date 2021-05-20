import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import type { NonPayableTx } from '@dimensiondev/contracts/types/types'
import stringify from 'json-stable-stringify'
import type { TransactionReceipt } from 'web3-core'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionEventType } from '../../../web3/types'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { useITO_Contract } from '../contracts/useITO_Contract'
import Services from '../../../extension/service'

export function useClaimCallback(pids: string[], contractAddress?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const ITO_Contract = useITO_Contract(contractAddress)
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!ITO_Contract || pids.length === 0) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }
        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // check if already claimed
        try {
            const availabilityList = await Promise.all(
                pids.map((pid) =>
                    ITO_Contract.methods.check_availability(pid).call({
                        from: account,
                    }),
                ),
            )

            const isClaimed = availabilityList.some((availability) => new BigNumber(availability.swapped).isZero())

            if (isClaimed) {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Already Claimed'),
                })
                return
            }
        } catch (e) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to check availability.'),
            })
            return
        }

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: ITO_Contract.options.address,
            data: ITO_Contract.methods.claim(pids).encodeABI(),
        }).catch((error) => {
            setClaimState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

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
    }, [account, chainId, ITO_Contract, stringify(pids)])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
