import { useAsync } from 'react-use'
import { GoPlusLabs } from '@masknet/web3-providers'
import { useNetworkDescriptors } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

const unIntegrationChainLogos: Record<number, URL> = {
    128: new URL('../../assets/chain-heco.png', import.meta.url),
    66: new URL('../../assets/chain-okex.png', import.meta.url),
    25: new URL('../../assets/chain-cronos.png', import.meta.url),
}

export const useSupportedChains = () => {
    const networks = useNetworkDescriptors(NetworkPluginID.PLUGIN_EVM)

    return useAsync(async () => {
        const chains = await GoPlusLabs.getSupportedChain()
        return chains.map((x) => {
            const network = networks.find((n) => n.chainId === x.chainId)
            const icon: URL | undefined = unIntegrationChainLogos[x.chainId]
            return { ...x, icon, ...network }
        })
    }, [networks])
}
