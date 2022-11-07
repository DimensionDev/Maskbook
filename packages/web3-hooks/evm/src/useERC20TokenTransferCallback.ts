import { useAsyncFn } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { GasConfig, TransactionEventType, isValidAddress } from '@masknet/web3-shared-evm'
import { useERC20TokenContract } from './useERC20TokenContract.js'

export function useERC20TokenTransferCallback(address?: string, amount?: string, recipient?: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const erc20Contract = useERC20TokenContract(chainId, address)

    return useAsyncFn(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !recipient || !amount || isZero(amount) || !erc20Contract) {
                return
            }

            // error: invalid recipient address
            if (!isValidAddress(recipient)) return

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
            })
        },
        [account, address, amount, recipient, erc20Contract],
    )
}
