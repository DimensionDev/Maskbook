import { EthereumNetwork } from './database/types'
import { createNewSettings } from '../../components/shared-settings/createSettings'

const settings = {
    contractAddress: {
        [EthereumNetwork.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [EthereumNetwork.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [EthereumNetwork.Ropsten]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
    },
    middlewareAddress: {
        [EthereumNetwork.Mainnet]: 'wss://mainnet.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
        [EthereumNetwork.Rinkeby]: 'wss://rinkeby.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
        [EthereumNetwork.Ropsten]: 'wss://ropsten.infura.io/ws/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
    },
} as {
    contractAddress: Record<EthereumNetwork, string>
    middlewareAddress: Record<EthereumNetwork, string>
}

export function getNetworkSettings() {
    const networkType = ethereumNetworkSettings.value

    return {
        networkType,
        contractAddress: settings.contractAddress[networkType],
        middlewareAddress: settings.middlewareAddress[networkType],
    }
}

export const ethereumNetworkSettings = createNewSettings<EthereumNetwork>('eth network', EthereumNetwork.Rinkeby, {
    primary: () => 'Ethereum Network',
    secondary: () =>
        `You can choose ${EthereumNetwork.Mainnet}, ${EthereumNetwork.Rinkeby} or ${EthereumNetwork.Ropsten}`,
})
