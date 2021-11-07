import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useTransactionState, TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useTreasuryContract } from '../contracts/useTreasuryContract'

/**
 * A callback for deposit into reality cards
 * @param amount
 */
export function useDepositCallback(amount: string) {
    const account = useAccount()
    const contract = useTreasuryContract()
    const [state, setState] = useTransactionState()

    const callback = useCallback(async () => {
        if (!contract) {
            setState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(0).toFixed(),
        }
        const estimatedGas = await contract.methods
            .deposit(amount, account)
            .estimateGas(config)
            .catch((error) => {
                setState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            contract.methods
                .deposit(amount, account)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.CONFIRMATION, (confNumber, receipt) => {
                    setState({
                        type: TransactionStateType.CONFIRMED,
                        no: confNumber,
                        receipt,
                    })
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, contract])

    const resetCallback = useCallback(() => {
        setState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [state, callback, resetCallback] as const
}
