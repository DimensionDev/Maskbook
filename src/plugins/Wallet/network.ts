export enum NetworkType {
    Mainnet = 'mainnet',
    Rinkeby = 'rinkeby',
    Reopsten = 'reopsten',
}

const settings = {
    contractAddress: {
        [NetworkType.Mainnet]: '0x9ab3edd567fa8B28f6AbC1fb14b1fB7a30140575',
        [NetworkType.Rinkeby]: '0xC21F17f4f2E04ae718f1e65a29C833627eaA0b6f',
        [NetworkType.Reopsten]: '0x9ab3edd567fa8B28f6AbC1fb14b1fB7a30140575',
    },
    middlewareAddress: {
        [NetworkType.Mainnet]: 'wss://mainnet.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
        [NetworkType.Rinkeby]: 'wss://rinkeby.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
        [NetworkType.Reopsten]: 'wss://reopsten.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
    },
} as {
    contractAddress: Record<NetworkType, string>
    middlewareAddress: Record<NetworkType, string>
}

export function getNetworkSettings() {
    const networkType = getNetworkType()

    return {
        networkType,
        contractAddress: settings.contractAddress[networkType],
        middlewareAddress: settings.middlewareAddress[networkType],
    }
}

export function getNetworkType() {
    return (localStorage.getItem('red_packet_plugin_network_type') as NetworkType) || NetworkType.Rinkeby
}

export function setNetworkType(networkType: NetworkType) {
    localStorage.setItem('red_packet_plugin_network_type', networkType)
}
