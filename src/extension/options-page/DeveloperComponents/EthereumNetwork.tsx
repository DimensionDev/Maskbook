import React, { useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { getNetworkSettings, NetworkType, setNetworkType, getNetworkType } from '../../../plugins/Wallet/network'
import { Box, Select, MenuItem } from '@material-ui/core'
import { resetProvider } from '../../../plugins/Wallet/web3'

const useStyles = makeStyles({
    select: {
        marginLeft: 10,
    },
})

export function EthereumNetwork() {
    const classes = useStyles()
    const [network, setNetwork] = useState<NetworkType>(getNetworkSettings().networkType)
    const onChange = useCallback((event: React.ChangeEvent<any>) => {
        setNetworkType(event.target.value as NetworkType)
        setNetwork(getNetworkType())
        resetProvider()
    }, [])

    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center">
                    <Typography color="textSecondary">Select ethereum network</Typography>
                    <Select className={classes.select} value={network} onChange={onChange}>
                        {Object.values(NetworkType).map(type => (
                            <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </Box>
            </CardContent>
        </Card>
    )
}
