import React from 'react'
import { Card, Box } from '@material-ui/core'
import { ethereumNetworkSettings } from '../../network'
import { EthereumNetwork } from '../../database/types'
import { SettingsUIEnum } from '../../../../components/shared-settings/useSettingsUI'
import { currentEthereumNetworkSettings } from './EthereumNetworkSettings'

export function SelectEthereumNetwork() {
    return (
        <Card>
            <Box display="flex" alignItems="center">
                <SettingsUIEnum enumObject={EthereumNetwork} value={ethereumNetworkSettings} />
            </Box>
        </Card>
    )
}
