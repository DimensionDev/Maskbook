import React from 'react'
import { ListSubheader, Grid, makeStyles, List } from '@material-ui/core'
import { AddProve } from './DeveloperComponents/AddProve'
import { DecryptPostDeveloperMode } from './DeveloperComponents/DecryptPost'
import { SeeMyProvePost } from './DeveloperComponents/SeeMyProvePost'
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
const DevPage = () => {
    const classes = useStyles()
    return (
        <>
            <ListSubheader disableSticky>Developer Settings</ListSubheader>
            <div className={classes.root}>
                <List>{useSettingsUI(debugModeSetting)}</List>
                <List>{useSettingsUI(steganographyModeSetting)}</List>
                <List>{useSettingsUI(disableOpenNewTabInBackgroundSettings)}</List>
                <Grid container item spacing={2} direction="column" alignItems="stretch" wrap="nowrap">
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

export default DevPage
