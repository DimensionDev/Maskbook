import { useCallback } from 'react'
import { toHex } from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useTransactionState } from './useTransactionState'
import { useWeb3 } from './useWeb3'
import { isGreaterThan, isZero } from '../utils'
import { TransactionStateType, GasConfig } from '../types'

export function useNativeTransferCallback() {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig, memo?: string) => {
            if (!account || !recipient || !amount || isZero(amount)) {
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
            const balance = await web3.eth.getBalance(account)

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

            // send transaction and wait for hash
            const config = {
                from: account,
                to: recipient,
                gas: await web3.eth
                    .estimateGas({
                        from: account,
                        to: recipient,
                        value: amount,
                        data: memo ? toHex(memo) : undefined,
                    })
                    .catch((error) => {
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        throw error
                    }),
                value: amount,
                data: memo ? toHex(memo) : undefined,
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                web3.eth.sendTransaction(config, (error, hash) => {
                    if (error) {
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setTransferState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    }
                })
            })
        },
        [web3, account, chainId],
    )

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
