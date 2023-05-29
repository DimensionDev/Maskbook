import { useAsyncFn } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import { useITO_Contract } from './useITO_Contract.js'

export function useDestructCallback(ito_address: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { contract: ITO_Contract } = useITO_Contract(chainId, ito_address)

    return useAsyncFn(
        async (id: string) => {
            if (!ITO_Contract || !id) return
            const tx = await new ContractTransaction(ITO_Contract).fillAll(ITO_Contract.methods.destruct(id), {
                from: account,
            })
            return Web3.sendTransaction(tx, {
                chainId,
            })
        },
        [chainId, ITO_Contract],
    )
}
