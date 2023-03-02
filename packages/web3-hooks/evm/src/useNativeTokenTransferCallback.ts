import { useAsyncFn } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { toHex } from 'web3-utils'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { type GasConfig, TransactionEventType } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'

export function useNativeTransferCallback() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig, memo?: string) => {
            if (!account || !recipient || !amount || isZero(amount) || !web3) return

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
