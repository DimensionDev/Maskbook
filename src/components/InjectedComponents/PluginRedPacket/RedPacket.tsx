import React from 'react'

import { Button, Typography, makeStyles, createStyles } from '@material-ui/core'
import { RedPacketWithState } from '../../../extension/options-page/DashboardComponents/RedPacket'

const useStyles = makeStyles(theme =>
    createStyles({
        button: {
            width: 190,
            margin: 'auto',
            display: 'block',
        },
        detail: {
            textAlign: 'center',
            marginTop: theme.spacing(1),
        },
    }),
)

export default function PluginRedPacket() {
    const classes = useStyles()
    return (
        <div>
            <Button variant="contained" color="primary" className={classes.button}>
                Open Red Packet
            </Button>
            <Typography color="primary" variant="body1" className={classes.detail}>
                View Details
            </Typography>
        </div>
    )
}
