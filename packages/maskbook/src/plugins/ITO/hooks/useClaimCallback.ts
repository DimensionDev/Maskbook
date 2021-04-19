import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionEventType } from '../../../web3/types'
import { addGasMargin } from '../../../web3/helpers'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useITO_Contract } from '../contracts/useITO_Contract'

export function useClaimCallback(pid: string) {
    const account = useAccount()
    const chainId = useChainId()
    const ITO_Contract = useITO_Contract()
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!ITO_Contract) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }
        // pre-step: start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: ITO_Contract.options.address,
            value: '0',
        }

        // step 1: estimate gas
        const estimatedGas = await ITO_Contract.methods
            .claim([pid])
            .estimateGas(config)
            .catch((error: Error) => {
                setClaimState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = ITO_Contract.methods.claim([pid]).send({
                gas: addGasMargin(estimatedGas).toFixed(),
                ...config,
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
    }, [account, chainId, ITO_Contract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
