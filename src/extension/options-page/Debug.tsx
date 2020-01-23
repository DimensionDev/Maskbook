import React from 'react'
import { Grid, makeStyles, List } from '@material-ui/core'
import { AddProve } from './DeveloperComponents/AddProve'
import { DecryptPostDeveloperMode } from './DeveloperComponents/DecryptPost'
import { SeeMyProvePost } from './DeveloperComponents/SeeMyProvePost'
import { EthereumNetwork } from './DeveloperComponents/EthereumNetwork'
import { FriendsDeveloperMode } from './DeveloperComponents/Friends'
import {
    debugModeSetting,
    steganographyModeSetting,
    disableOpenNewTabInBackgroundSettings,
} from '../../components/shared-settings/settings'
import { useSettingsUI } from '../../components/shared-settings/createSettings'

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(0, 2),
    },
}))
const DashboardDebugPage = () => {
    const classes = useStyles()
    return (
        <>
            <div className={classes.root}>
                <List>{useSettingsUI(debugModeSetting)}</List>
                <List>{useSettingsUI(steganographyModeSetting)}</List>
                <List>{useSettingsUI(disableOpenNewTabInBackgroundSettings)}</List>
                <Grid container item spacing={2} direction="column" alignItems="stretch" wrap="nowrap">
                    <Grid item>
                        <EthereumNetwork />
                    </Grid>
                    <Grid item>
                        <SeeMyProvePost />
                    </Grid>
                    <Grid item>
                        <AddProve />
                    </Grid>
                    <Grid item>
                        <DecryptPostDeveloperMode />
                    </Grid>
                    <Grid item>
                        <FriendsDeveloperMode />
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default DashboardDebugPage
