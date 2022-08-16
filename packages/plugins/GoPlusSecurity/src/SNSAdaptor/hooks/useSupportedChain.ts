import { useNetworkDescriptors } from '@masknet/plugin-infra/web3'
import { GoPlusLabs } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'

export const useSupportedChain = () => {
    const networks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)

    return useAsync(async () => {
        const chains = await GoPlusLabs.getSupportedChain()
        return chains.map((x) => {
            const network = networks.find((n) => n.chainId === x.chainId)
            return { ...x, ...network }
        })
    }, [networks])
}
