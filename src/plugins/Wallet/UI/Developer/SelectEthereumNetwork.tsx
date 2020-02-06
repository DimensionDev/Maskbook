import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { currentEthereumNetworkSettings } from '../../network'
import { Box } from '@material-ui/core'
import { EthereumNetwork } from '../../database/types'
import { SettingsUI } from '../../../../components/shared-settings/useSettingsUI'

export function SelectEthereumNetwork() {
    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center">
                    <SettingsUI value={currentEthereumNetworkSettings} mode={{ type: 'enum', enum: EthereumNetwork }} />
                </Box>
            </CardContent>
        </Card>
    )
}
