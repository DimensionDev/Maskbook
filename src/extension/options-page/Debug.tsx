import React from 'react'
import { Grid, makeStyles, List } from '@material-ui/core'
import { AddProve } from './DeveloperComponents/AddProve'
import { DecryptPostDeveloperMode } from './DeveloperComponents/DecryptPost'
import { SeeMyProvePost } from './DeveloperComponents/SeeMyProvePost'
import { SelectEthereumNetwork } from '../../plugins/Wallet/UI/Developer/SelectEthereumNetwork'
import { FriendsDeveloperMode } from './DeveloperComponents/Friends'
import {
    debugModeSetting,
    steganographyModeSetting,
    disableOpenNewTabInBackgroundSettings,
    languageSettings,
    Language,
} from '../../components/shared-settings/settings'
import { SettingsUI } from '../../components/shared-settings/useSettingsUI'

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
                <List>
                    <SettingsUI value={languageSettings} mode={{ enum: Language, type: 'enum' }} />
                    <SettingsUI value={debugModeSetting} />
                    <SettingsUI value={steganographyModeSetting} />
                    <SettingsUI value={disableOpenNewTabInBackgroundSettings} />
                </List>
                <Grid container item spacing={2} direction="column" alignItems="stretch" wrap="nowrap">
                    <Grid item>
                        <SelectEthereumNetwork />
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
