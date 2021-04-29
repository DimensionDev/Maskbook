import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import Services from '../../extension/service'
import { toHex } from 'web3-utils'
import type { TransactionConfig } from 'web3-core'
import { useChainId } from './useBlockNumber'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { EthereumAddress } from 'wallet.ts'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'
import { nonFunctionalWeb3 } from '../web3'

export function useEtherTransferCallback(amount?: string, recipient?: string, memo?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const [transferState, setTransferState] = useTransactionState()
    const PROVIDER_ADDRESS_LIST = useConstant(CONSTANTS, 'PROVIDER_ADDRESS_LIST')

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

        const config: TransactionConfig = {
            from: account,
            to: recipient,
            value: amount,

            // FIXME:
            // the ether tx will be canceled by quicknode's holy-water provider.
            // @ts-ignore
            __provider_url__: PROVIDER_ADDRESS_LIST[1],
        }

        // encode memo as data
        if (memo) config.data = toHex(memo)

        // step 1: estimate gas
        const config_ = await Services.Ethereum.composeTransaction(config).catch((error) => {
            setTransferState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            nonFunctionalWeb3.eth.sendTransaction(config_, (error, hash) => {
                if (error) {
                    setTransferState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                    return
                }
                setTransferState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve(hash)
            })
        })
    }, [account, amount, chainId, recipient, memo, PROVIDER_ADDRESS_LIST])

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transferState, transferCallback, resetCallback] as const
}
