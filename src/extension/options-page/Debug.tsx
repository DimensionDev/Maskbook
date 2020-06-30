import React from 'react'
import { Grid, makeStyles } from '@material-ui/core'
import { AddProve } from './DeveloperComponents/AddProve'
import { InfuraConnection } from './DeveloperComponents/InfuraConnection'
import { DecryptPostDeveloperMode } from './DeveloperComponents/DecryptPost'
import { SeeMyProvePost } from './DeveloperComponents/SeeMyProvePost'
import { SelectEthereumNetwork } from '../../plugins/Wallet/UI/Developer/SelectEthereumNetwork'
import { FriendsDeveloperMode } from './DeveloperComponents/Friends'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(0, 2),
    },
}))
const DashboardDebugPage = () => {
    const classes = useStyles()
    return (
        <>
            <div className={classes.root}>
                <Grid container item spacing={2} direction="column" alignItems="stretch" wrap="nowrap">
                    <Grid item>
                        <SelectEthereumNetwork />
                    </Grid>
                    <Grid item>
                        <InfuraConnection />
                    </Grid>
                    <Grid item>
                        <SeeMyProvePost />
                    </Grid>
                    <Grid item>
                        <AddProve />
                    </Grid>
                    {/* <Grid item>
                        <DecryptPostDeveloperMode />
                    </Grid> */}
                    <Grid item>
                        <FriendsDeveloperMode />
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default DashboardDebugPage
