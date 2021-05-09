import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionEventType } from '../../../web3/types'
import { useMaskITO_Contract } from '../contracts/useMaskITO_Contract'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import Services from '../../../extension/service'

export function useMaskClaimCallback() {
    const account = useAccount()
    const chainId = useChainId()
    const MaskITO_Contract = useMaskITO_Contract()
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!MaskITO_Contract) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: MaskITO_Contract.options.address,
            data: MaskITO_Contract.methods.claim().encodeABI(),
        }).catch((error) => {
            setClaimState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = MaskITO_Contract.methods.claim().send(config as Tx)
            promiEvent
                .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, chainId, MaskITO_Contract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
