import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useITO_Contract } from './useITO_Contract'

export function useDestructCallback(ito_address: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { contract: ITO_Contract } = useITO_Contract(chainId, ito_address)

    return useAsyncFn(
        async (id: string) => {
            if (!ITO_Contract || !id) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await ITO_Contract.methods.destruct(id).estimateGas({
                    from: account,
                }),
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                ITO_Contract.methods
                    .destruct(id)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error: Error) => {
                        reject(error)
                    })
            })
        },
        [ITO_Contract],
    )
}
