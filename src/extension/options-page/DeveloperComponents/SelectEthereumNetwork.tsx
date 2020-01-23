import React, { useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { getNetworkSettings, setNetworkType, getNetworkType } from '../../../plugins/Wallet/network'
import { Box, Select, MenuItem } from '@material-ui/core'
import { resetProvider } from '../../../plugins/Wallet/web3'
import { EthereumNetwork } from '../../../plugins/Wallet/database/types'

const useStyles = makeStyles({
    select: {
        marginLeft: 10,
    },
})

export function SelectEthereumNetwork() {
    const classes = useStyles()
    const [network, setNetwork] = useState<EthereumNetwork>(getNetworkSettings().networkType)
    const onChange = useCallback((event: React.ChangeEvent<any>) => {
        setNetworkType(event.target.value as EthereumNetwork)
        setNetwork(getNetworkType())
        resetProvider()
    }, [])

    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center">
                    <Typography color="textSecondary">Select ethereum network</Typography>
                    <Select className={classes.select} value={network} onChange={onChange}>
                        {Object.values(EthereumNetwork).map(type => (
                            <MenuItem value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </Box>
            </CardContent>
        </Card>
    )
}
