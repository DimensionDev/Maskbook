import React from 'react'
import Card from '@material-ui/core/Card'
import { Box } from '@material-ui/core'
import { EthereumNetwork } from '../../database/types'
import { SettingsUIEnum } from '../../../../components/shared-settings/useSettingsUI'
import { createNewSettings } from '../../../../components/shared-settings/createSettings'

const settings = {
    splitterContractAddress: {
        [EthereumNetwork.Mainnet]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
        [EthereumNetwork.Rinkeby]: '',
        [EthereumNetwork.Ropsten]: '',
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
    splitterContractAddress: Record<EthereumNetwork, string>
    happyRedPacketContractAddress: Record<EthereumNetwork, string>
    middlewareAddress: Record<EthereumNetwork, string>
}

export function getNetworkSettings() {
    const networkType = currentEthereumNetworkSettings.value

    return {
        networkType,
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

export function SelectEthereumNetwork() {
    return (
        <Card>
            <Box display="flex" alignItems="center">
                <SettingsUIEnum enumObject={EthereumNetwork} value={currentEthereumNetworkSettings} />
            </Box>
        </Card>
    )
}
