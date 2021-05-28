import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import type { NonPayableTx } from '@dimensiondev/contracts/types/types'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import Services from '../../extension/service'
import { TransactionEventType } from '@dimensiondev/web3-shared'

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

        if (new BigNumber(amount).isGreaterThan(balance)) {
            setTransferState({
                type: TransactionStateType.FAILED,
                error: new Error('Insufficent balance'),
            })
            return
        }

        // start waiting for provider to confirm tx
        setTransferState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: erc20Contract.options.address,
            data: erc20Contract.methods.transfer(recipient, amount).encodeABI(),
        }).catch((error) => {
            setTransferState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

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
    }, [account, address, amount, recipient, erc20Contract])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
