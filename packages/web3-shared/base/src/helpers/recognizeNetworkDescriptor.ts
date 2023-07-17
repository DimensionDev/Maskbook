import type { ChainDescriptor, NetworkDescriptor, RecognizableNetwork } from '../specs/index.js'

export function recognizeNetwork(
    chain: ChainDescriptor<number, string, string>,
    network: NetworkDescriptor<number, string>,
): RecognizableNetwork {
    return {
        id: network.ID,
        name: network.name,
        chainId: network.chainId,
        nativeCurrency: {
            name: chain.nativeCurrency.name,
            symbol: chain.nativeCurrency.symbol,
            decimals: chain.nativeCurrency.decimals,
        },
        blockExplorerUrl: chain.explorerUrl.url,
        rpcUrl: '',
        iconUrl: network.icon,
        features: chain.features,
        isRegisterd: true,
    }
}
