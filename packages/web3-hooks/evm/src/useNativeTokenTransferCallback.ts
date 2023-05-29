import { useAsyncFn } from 'react-use'
import { toHex } from 'web3-utils'
import { Web3 } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isValidAddress, type GasConfig } from '@masknet/web3-shared-evm'

export function useNativeTransferCallback() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return useAsyncFn(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig, memo?: string) => {
            if (!account || !recipient || !amount || isZero(amount)) return

            // error: invalid recipient address
            if (!isValidAddress(recipient)) return

            // error: insufficient balance
            const balance = await Web3.getBalance(account)

            if (isGreaterThan(amount, balance)) return

            // send transaction and wait for hash
            const config = {
                from: account,
                to: recipient,
                gas: await Web3.estimateTransaction?.({
                    from: account,
                    to: recipient,
                    value: amount,
                    data: memo ? toHex(memo) : undefined,
                }).catch((error) => {
                    throw error
                }),
                value: amount,
                data: memo ? toHex(memo) : undefined,
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                try {
                    const transactionHash = await Web3.sendTransaction(config)

                    resolve(transactionHash)
                } catch (error) {
                    reject(error)
                }
            })
        },
        [account, chainId],
    )
}
