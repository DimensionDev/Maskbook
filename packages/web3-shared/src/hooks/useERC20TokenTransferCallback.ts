import { useCallback } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { TransactionEventType } from '../types'
import { useNonce } from './useNonce'
import { useGasPrice } from './useGasPrice'
import { isGreaterThan, isZero } from '../utils'

export function useERC20TokenTransferCallback(address?: string, amount?: string, recipient?: string) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !amount || isZero(amount) || !erc20Contract) {
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

        // error: insufficient balance
        const balance = await erc20Contract.methods.balanceOf(account).call()

        if (isGreaterThan(amount, balance)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Insufficient balance'),
            })
            return
        }

        // start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await erc20Contract.methods
                .transfer(recipient, amount)
                .estimateGas({
                    from: account,
                })
                .catch((error) => {
                    setTransferState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
            gasPrice,
            nonce,
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            erc20Contract.methods
                .transfer(recipient, amount)
                .send(config as NonPayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setTransferState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setTransferState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [nonce, gasPrice, account, address, amount, recipient, erc20Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
