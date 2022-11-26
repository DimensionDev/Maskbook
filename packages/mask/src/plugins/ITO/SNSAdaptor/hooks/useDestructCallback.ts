import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useITO_Contract } from './useITO_Contract.js'

export function useDestructCallback(ito_address: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { contract: ITO_Contract } = useITO_Contract(chainId, ito_address)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(
        async (id: string) => {
            if (!connection || !ITO_Contract || !id) return

            const config = {
                from: account,
            }

            const tx = await new ContractTransaction(ITO_Contract).encodeContractTransactionWithGas(
                ITO_Contract.methods.destruct(id),
                config,
            )
            return connection.sendTransaction(tx)
        },
        [ITO_Contract, connection],
    )
}
