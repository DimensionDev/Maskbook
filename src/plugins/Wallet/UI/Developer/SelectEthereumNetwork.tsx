import React, { useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { getNetworkSettings, currentEthereumNetworkSettings } from '../../network'
import { Box, Select, MenuItem } from '@material-ui/core'
import { resetProvider } from '../../web3'
import { EthereumNetwork } from '../../database/types'
import { useSettingsUI } from '../../../../components/shared-settings/createSettings'

const useStyles = makeStyles({
    select: {
        marginLeft: 10,
    },
})

export function SelectEthereumNetwork() {
    const classes = useStyles()
    const [network, setNetwork] = useState<EthereumNetwork>(getNetworkSettings().networkType)
    const onChange = useCallback((event: React.ChangeEvent<any>) => {
        const value = event.target.value
        if (!(EthereumNetwork as any)[value]) {
            throw new Error('Unknown ETH Network')
        }
        currentEthereumNetworkSettings.value = value as EthereumNetwork
        setNetwork(currentEthereumNetworkSettings.value)
        resetProvider()
    }, [])

    const us = useSettingsUI(currentEthereumNetworkSettings, { type: 'enum', enum: EthereumNetwork })

    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center">
                    {useSettingsUI(currentEthereumNetworkSettings, { type: 'enum', enum: EthereumNetwork })}
                    {/* <Typography color="textSecondary">Select ethereum network</Typography>
                    <Select className={classes.select} value={network} onChange={onChange}>
                        {Object.values(EthereumNetwork).map(type => (
                            <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select> */}
                </Box>
            </CardContent>
        </Card>
    )
}
