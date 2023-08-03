import { useAsync } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'
import { useNetworkDescriptors } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export const useSupportedChains = () => {
    const networks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)

    return useAsync(async () => {
        const chains = await GoPlusLabs.getSupportedChain()
        return chains.map((x) => {
            const network = networks.find((n) => n.chainId === x.chainId)
            return { ...x, ...network }
        })
    }, [networks])
}
