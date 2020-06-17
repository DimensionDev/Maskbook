import { EthereumNetwork } from '../../database/types'
import { createNewSettings } from '../../../../components/shared-settings/createSettings'

const settings = {
    gitcoinMaintainerAddress: {
        [EthereumNetwork.Mainnet]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [EthereumNetwork.Rinkeby]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [EthereumNetwork.Ropsten]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
    },
    splitterContractAddress: {
        [EthereumNetwork.Mainnet]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
        [EthereumNetwork.Rinkeby]: '0xe93b4fF96201B68078E9fdDB8314BF732E9FFF91',
        [EthereumNetwork.Ropsten]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
    },
    bulkCheckoutContractAddress: {
        [EthereumNetwork.Mainnet]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [EthereumNetwork.Rinkeby]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [EthereumNetwork.Ropsten]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
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
    gitcoinMaintainerAddress: Record<EthereumNetwork, string>
    splitterContractAddress: Record<EthereumNetwork, string>
    bulkCheckoutContractAddress: Record<EthereumNetwork, string>
    happyRedPacketContractAddress: Record<EthereumNetwork, string>
    middlewareAddress: Record<EthereumNetwork, string>
}

export function getNetworkSettings() {
    const networkType = currentEthereumNetworkSettings.value

    return {
        networkType,
        gitcoinMaintainerAddress: settings.gitcoinMaintainerAddress[networkType],
        splitterContractAddress: settings.splitterContractAddress[networkType],
        bulkCheckoutContractAddress: settings.bulkCheckoutContractAddress[networkType],
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
