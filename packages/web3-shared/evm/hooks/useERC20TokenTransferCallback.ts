import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import { useCallback, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { GasConfig, TransactionEventType } from '../types'
import { useAccount } from './useAccount'

export function useERC20TokenTransferCallback(address?: string, amount?: string, recipient?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [loading, setLoading] = useState(false)

    const transferCallback = useCallback(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !recipient || !amount || isZero(amount) || !erc20Contract) {
                return
            }

            // error: invalid recipient address
            if (!EthereumAddress.isValid(recipient)) return

            // error: insufficient balance
            const balance = await erc20Contract.methods.balanceOf(account).call()

            if (isGreaterThan(amount, balance)) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await erc20Contract.methods
                    .transfer(recipient, amount)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        setLoading(false)
                        throw error
                    }),
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                erc20Contract.methods
                    .transfer(recipient, amount)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject(error)
                    })
            }).finally(() => setLoading(false))
        },
        [account, address, amount, recipient, erc20Contract],
    )

    return [loading, transferCallback] as const
}
