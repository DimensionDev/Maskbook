import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { toHex } from 'web3-utils'
import { GasConfig, TransactionEventType } from '../types'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3 } from './useWeb3'

export function useNativeTransferCallback() {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()

    return useAsyncFn(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig, memo?: string) => {
            if (!account || !recipient || !amount || isZero(amount)) return

            // error: invalid recipient address
            if (!EthereumAddress.isValid(recipient)) return

            // error: insufficient balance
            const balance = await web3.eth.getBalance(account)

            if (isGreaterThan(amount, balance)) return

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
                        throw error
                    }),
                value: amount,
                data: memo ? toHex(memo) : undefined,
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                web3.eth
                    .sendTransaction(config, (error) => {
                        if (!error) return
                        reject(error)
                    })
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
            })
        },
        [web3, account, chainId],
    )
}
