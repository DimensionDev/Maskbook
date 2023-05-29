import { useAsyncFn } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { Contract } from '@masknet/web3-providers'
import { type GasConfig, TransactionEventType, isValidAddress } from '@masknet/web3-shared-evm'

export function useERC20TokenTransferCallback(address?: string, amount?: string, recipient?: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return useAsyncFn(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !address || !recipient || !amount || isZero(amount)) {
                return
            }

            // error: invalid recipient address
            if (!isValidAddress(recipient)) return

            const contract = Contract.getERC20Contract(address, { chainId })
            if (!contract) return

            // error: insufficient balance
            const balance = await contract.methods.balanceOf(account).call()

            if (isGreaterThan(amount, balance)) return

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                contract.methods
                    .transfer(recipient, amount)
                    .send({
                        from: account,
                        gas: await contract.methods
                            .transfer(recipient, amount)
                            .estimateGas({
                                from: account,
                            })
                            .catch((error) => {
                                throw error
                            }),
                        ...gasConfig,
                    })
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject(error)
                    })
            })
        },
        [account, address, amount, recipient],
    )
}
