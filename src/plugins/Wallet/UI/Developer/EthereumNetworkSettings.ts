import { EthereumNetwork } from '../../database/types'
import { currentEthereumNetworkSettings } from '../../../../settings/settings'
import contractMap from 'eth-contract-metadata'
import mainnet from '../../erc20/mainnet.json'
import rinkeby from '../../erc20/rinkeby.json'
import type { ERC20Token } from '../../token'

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
    balanceCheckerContractAddress: {
        [EthereumNetwork.Mainnet]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [EthereumNetwork.Rinkeby]: '0xe3AE8Ae4160680C7Ac0FB0A79F519d7D7eAe06aB',
        [EthereumNetwork.Ropsten]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
    },
    middlewareAddress: {
        [EthereumNetwork.Mainnet]: 'wss://mainnet.infura.io/ws/v3/154b82e9c0e048c3872309241045cf1f',
        [EthereumNetwork.Rinkeby]: 'wss://rinkeby.infura.io/ws/v3/154b82e9c0e048c3872309241045cf1f',
        [EthereumNetwork.Ropsten]: 'wss://ropsten.infura.io/ws/v3/154b82e9c0e048c3872309241045cf1f',
    },
}

export function getNetworkSettings(network: EthereumNetwork = currentEthereumNetworkSettings.value) {
    return {
        networkType: network,
        gitcoinMaintainerAddress: settings.gitcoinMaintainerAddress[network],
        splitterContractAddress: settings.splitterContractAddress[network],
        bulkCheckoutContractAddress: settings.bulkCheckoutContractAddress[network],
        happyRedPacketContractAddress: settings.happyRedPacketContractAddress[network],
        balanceCheckerContractAddress: settings.balanceCheckerContractAddress[network],
        middlewareAddress: settings.middlewareAddress[network],
    }
}

const ERC20Tokens = {
    [EthereumNetwork.Mainnet]: [
        ...Object.entries(contractMap)
            .filter(([_, token]) => token.erc20)
            .map(([address, token]) => ({
                address,
                decimals: token.decimals,
                name: token.name,
                symbol: token.symbol,
            }))
            .filter(Boolean),
        ...mainnet.built_in_tokens.filter((token) => !contractMap[token.address]),
        ...mainnet.predefined_tokens.filter((token) => !contractMap[token.address]),
    ],
    [EthereumNetwork.Rinkeby]: [...rinkeby.built_in_tokens, ...rinkeby.predefined_tokens],
    [EthereumNetwork.Ropsten]: [],
}

export function getNetworkERC20Tokens(network: EthereumNetwork = currentEthereumNetworkSettings.value) {
    return ERC20Tokens[network] as ERC20Token[]
}
