import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import type { TransactionReceipt } from 'web3-core'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { TransactionEventType } from '../types'

export function useERC20TokenTransferCallback(address: string, amount?: string, recipient?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !amount || new BigNumber(amount).isZero() || !erc20Contract) {
            setTransferState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error: invalid recipient address
        if (!EthereumAddress.isValid(recipient)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid recipient address'),
            })
            return
        }

        // error: insufficent balance
        const balance = await erc20Contract.methods.balanceOf(account).call()

        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Insufficent balance'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const estimatedGas = await erc20Contract.methods.transfer(recipient, amount).estimateGas({
            from: account,
            to: erc20Contract.options.address,
        })

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = erc20Contract.methods.transfer(recipient, amount).send({
                from: account,
                to: erc20Contract.options.address,
                gas: estimatedGas,
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setTransferState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
            })
            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                setTransferState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            })
            promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                setTransferState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            })
        })
    }, [account, address, amount, recipient, erc20Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
