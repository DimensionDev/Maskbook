import React from 'react'
import { ListSubheader, Grid, makeStyles, List } from '@material-ui/core'
import { AddProve } from './DeveloperComponents/AddProve'
import { DecryptPostDeveloperMode } from './DeveloperComponents/DecryptPost'
import { SeeMyProvePost } from './DeveloperComponents/SeeMyProvePost'
import { FriendsDeveloperMode } from './DeveloperComponents/Friends'
import { debugModeSetting, disableOpenNewTabInBackgroundSettings } from '../../components/shared-settings/settings'
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
            <ListSubheader>Developer Settings</ListSubheader>
            <div className={classes.root}>
                <List>{useSettingsUI(debugModeSetting)}</List>
                <List>{useSettingsUI(disableOpenNewTabInBackgroundSettings)}</List>
                <Grid container xs={12} lg={6} item spacing={2} direction="column">
                    <Grid item>
                        <SeeMyProvePost />
                    </Grid>
                    <Grid item>
                        <AddProve />
                    </Grid>
                    <Grid item>
                        <DecryptPostDeveloperMode />
                    </Grid>
                </Grid>
                <Grid container xs={12} lg={6} item spacing={2} direction="column">
                    <Grid xs={12} item>
                        <FriendsDeveloperMode />
                    </Grid>
                </Grid>
            </div>
        </>
    )
}

export default DevPage
