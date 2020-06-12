import { EthereumNetwork } from '../../database/types'
import { createNewSettings } from '../../../../components/shared-settings/createSettings'

const settings = {
    gitcoinDonationAddress: {
        [EthereumNetwork.Mainnet]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [EthereumNetwork.Rinkeby]: '0xF292D41EBdCc4baF2a71121D2169d6Dfa2B56B8D',
        [EthereumNetwork.Ropsten]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
    },
    splitterContractAddress: {
        [EthereumNetwork.Mainnet]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
        [EthereumNetwork.Rinkeby]: '0xe93b4fF96201B68078E9fdDB8314BF732E9FFF91',
        [EthereumNetwork.Ropsten]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
    },
    happyRedPacketContractAddress: {
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
    gitcoinDonationAddress: Record<EthereumNetwork, string>
    splitterContractAddress: Record<EthereumNetwork, string>
    happyRedPacketContractAddress: Record<EthereumNetwork, string>
    middlewareAddress: Record<EthereumNetwork, string>
}

export function getNetworkSettings() {
    const networkType = currentEthereumNetworkSettings.value

    return {
        networkType,
        gitcoinDonationAddress: settings.gitcoinDonationAddress[networkType],
        splitterContractAddress: settings.splitterContractAddress[networkType],
        happyRedPacketContractAddress: settings.happyRedPacketContractAddress[networkType],
        middlewareAddress: settings.middlewareAddress[networkType],
    }
}

export const currentEthereumNetworkSettings = createNewSettings<EthereumNetwork>(
    'eth network',
    EthereumNetwork.Mainnet,
    {
        primary: () => 'Choose ETH network',
        secondary: () =>
            `You can choose ${EthereumNetwork.Mainnet}, ${EthereumNetwork.Rinkeby} or ${EthereumNetwork.Ropsten}`,
    },
)
