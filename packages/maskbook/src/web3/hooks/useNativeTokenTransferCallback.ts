import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { toHex } from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import { useAccount } from './useAccount'
import Services from '../../extension/service'
import { useChainId } from './useChainId'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { nonFunctionalWeb3 } from '../web3'

export function useNativeTransferCallback(amount?: string, recipient?: string, memo?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(async () => {
        if (!account || !recipient || !amount || new BigNumber(amount).isZero()) {
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
        const balance = await Services.Ethereum.getBalance(account)

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

        // send transaction and wait for hash
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: recipient,
            value: amount,
            data: memo ? toHex(memo) : undefined,
        }).catch((error) => {
            setTransferState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            nonFunctionalWeb3.eth.sendTransaction(config, (error, hash) => {
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
    }, [account, amount, chainId, recipient, memo])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
