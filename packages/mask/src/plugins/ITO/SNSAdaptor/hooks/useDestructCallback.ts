import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeContractTransaction } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useITO_Contract } from './useITO_Contract'

export function useDestructCallback(ito_address: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { contract: ITO_Contract } = useITO_Contract(chainId, ito_address)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(
        async (id: string) => {
            if (!ITO_Contract || !id) return

            const config = {
                from: account,
            }

            const tx = await encodeContractTransaction(ITO_Contract, ITO_Contract.methods.destruct(id), config)
            return connection.sendTransaction(tx)
        },
        [ITO_Contract, connection],
    )
}
