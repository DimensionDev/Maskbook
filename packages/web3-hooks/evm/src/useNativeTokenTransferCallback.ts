import { useAsyncFn } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isValidAddress, type GasConfig, type ChainId } from '@masknet/web3-shared-evm'

export function useNativeTransferCallback(expectedChainId?: ChainId) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })

    return useAsyncFn(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig, memo?: string) => {
            if (!account || !recipient || !amount || isZero(amount)) return

            // error: invalid recipient address
            if (!isValidAddress(recipient)) return

            // error: insufficient balance
            const balance = await EVMWeb3.getBalance(account)

            if (isGreaterThan(amount, balance)) return

            // send transaction and wait for hash
            const config = {
                from: account,
                to: recipient,
                gas: await EVMWeb3.estimateTransaction?.({
                    from: account,
                    to: recipient,
                    value: amount,
                    data: memo ? web3_utils.toHex(memo) : undefined,
                }).catch((error) => {
                    throw error
                }),
                value: amount,
                data: memo ? web3_utils.toHex(memo) : undefined,
                ...gasConfig,
                chainId,
            }

            // send transaction and wait for hash
            return EVMWeb3.sendTransaction(config)
        },
        [account, chainId],
    )
}
