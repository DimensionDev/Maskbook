import { useCallback } from 'react'
import type { NonPayableTx, PayableTx } from '@masknet/web3-contracts/types/types'
import { isLessThan, isZero, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, GasOptionConfig, TransactionEventType } from '@masknet/web3-shared-evm'
import { useNativeTokenWrapperContract } from './useWrappedEtherContract'
import { useAccount } from '../useAccount'

export function useNativeTokenWrapperCallback(chainId?: ChainId) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const wrapperContract = useNativeTokenWrapperContract(chainId)

    const wrapCallback = useCallback(
        async (amount: string, gasConfig?: GasOptionConfig) => {
            if (!wrapperContract || !amount) {
                return
            }

            // error: invalid deposit amount
            if (isZero(amount)) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                value: amount,
                gas: await wrapperContract.methods
                    .deposit()
                    .estimateGas({
                        from: account,
                        value: amount,
                    })
                    .catch((error) => {
                        throw error
                    }),
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                wrapperContract.methods
                    .deposit()
                    .send(config as PayableTx)
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject(error)
                    })
            })
        },
        [account, wrapperContract],
    )

    const unwrapCallback = useCallback(
        async (all = true, amount = '0', gasConfig?: GasOptionConfig) => {
            if (!wrapperContract || !amount) {
                return
            }

            // read balance
            const wethBalance = await wrapperContract.methods.balanceOf(account).call()

            // error: invalid withdraw amount
            if (all === false && isZero(amount)) {
                return
            }

            // error: insufficient weth balance
            if (all === false && isLessThan(wethBalance, amount)) {
                return
            }

            // estimate gas and compose transaction
            const withdrawAmount = all ? wethBalance : amount
            const config = {
                from: account,
                gas: await wrapperContract.methods
                    .withdraw(withdrawAmount)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        throw error
                    }),
                ...gasConfig,
            }
            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                wrapperContract.methods
                    .withdraw(withdrawAmount)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject(error)
                    })
            })
        },
        [account, wrapperContract],
    )

    return [wrapCallback, unwrapCallback] as const
}
