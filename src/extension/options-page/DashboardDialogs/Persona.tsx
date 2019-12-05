import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, InputBase, makeStyles } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import ProviderLine from '../DashboardComponents/ProviderLine'
import BackupRestoreTab, { BackupRestoreTabProps } from '../DashboardComponents/BackupRestoreTab'
import Buttone from '../../../components/Dashboard/Buttone'

export function PersonaCreateDialog() {
    const [name, setName] = useState('')

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                label="Name"></TextField>
        </div>
    )

    return (
        <DialogContentItem
            title="Create Persona"
            content={content}
            actionsAlign="center"
            actions={
                <Buttone
                    className="actionButton"
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`created?name=${name}`}>
                    Ok
                </Buttone>
            }></DialogContentItem>
    )
}

export function PersonaCreatedDialog() {
    const history = useHistory()
    const search = new URLSearchParams(history.location.search)
    const name = search.get('name')
    return (
        <DialogContentItem
            title="Persona Created"
            content={
                <>
                    {`New persona «${name}» has been created. Connect a profile now! ([I:b])`}
                    <section style={{ marginTop: 12 }}>
                        <ProviderLine network="facebook" border></ProviderLine>
                        <ProviderLine network="twitter" border></ProviderLine>
                    </section>
                </>
            }></DialogContentItem>
    )
}

export function PersonaDeleteDialog() {
    const history = useHistory()
    const search = new URLSearchParams(history.location.search)
    const name = search.get('name')
    return (
        <DialogContentItem
            simplified
            title="Delete Persona"
            content={`Do you really want to delete persona "${name}"? This operation cannot be reverted.`}
            actions={
                <>
                    <Buttone className="actionButton" variant="outlined" color="default" component={Link} to="../">
                        Cancel
                    </Buttone>
                    <Buttone className="actionButton" variant="contained" color="primary">
                        Ok
                    </Buttone>
                </>
            }></DialogContentItem>
    )
}

export function PersonaBackupDialog() {
    const mnemonicWordValue = 'the natural law of privacy is now enforced by tessercube and maskbook'
    const base64Value =
        'WFceyl2VOyvyeaqkTodUI1XulcXQkRVQvh3U65vvMUuRq2ln9ozlECaZYLkKq9HHWKucm9sc2e52y32I1FoikgstIsV1l/S5VwbvELkchC5Mh5eAbcSGCRotC9TfIBUlGwwwnaMZ8tNgo0jBxPgOeU2ikdoIrgkrIiMXYUe6nz/AmvbYDYBjuqNnArVpxILOuJ6ytKUZGaadrI3sct+rFHqK20YFAyjuZrBgSIkNrBcx5epysj2dKpnRd4zyLoRlJQ'

    const state = useState(0)
    const tabProps: BackupRestoreTabProps = {
        tabs: [
            {
                label: 'MNEMONIC WORDS',
                component: (
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        multiline
                        defaultValue={mnemonicWordValue}
                        readOnly></InputBase>
                ),
            },
            {
                label: 'BASE64',
                component: (
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        multiline
                        defaultValue={base64Value}
                        readOnly></InputBase>
                ),
            },
        ],
        state,
    }
    const content = (
        <>
            <Typography variant="body2">You can backup the persona with either way below.</Typography>
            <BackupRestoreTab margin={state[0] === 0 ? true : 'top'} {...tabProps}></BackupRestoreTab>
            {state[0] === 0 && (
                <Typography variant="body2">
                    Keep the 12 words above carefully in a safe place. You will need them to restore the private key of
                    this persona.
                </Typography>
            )}
        </>
    )

    return <DialogContentItem title="Backup Persona" content={content}></DialogContentItem>
}

const useImportDialogStyles = makeStyles({
    input: {
        width: '100%',
    },
})

export function PersonaImportDialog() {
    const mnemonicWordValue = 'the natural law of privacy is now enforced by tessercube and maskbook'
    const base64Value =
        'WFceyl2VOyvyeaqkTodUI1XulcXQkRVQvh3U65vvMUuRq2ln9ozlECaZYLkKq9HHWKucm9sc2e52y32I1FoikgstIsV1l/S5VwbvELkchC5Mh5eAbcSGCRotC9TfIBUlGwwwnaMZ8tNgo0jBxPgOeU2ikdoIrgkrIiMXYUe6nz/AmvbYDYBjuqNnArVpxILOuJ6ytKUZGaadrI3sct+rFHqK20YFAyjuZrBgSIkNrBcx5epysj2dKpnRd4zyLoRlJQ'

    const classes = useImportDialogStyles()

    const state = useState(0)
    const tabProps: BackupRestoreTabProps = {
        tabs: [
            {
                label: 'MNEMONIC WORDS',
                component: (
                    <>
                        <TextField className={classes.input} required label="Name" margin="dense" />
                        <TextField
                            className={classes.input}
                            required
                            defaultValue={mnemonicWordValue}
                            label="Mnemonic Words"
                            margin="dense"
                        />
                        <TextField
                            className={classes.input}
                            label="Password"
                            placeholder="Leave empty if not set"
                            margin="dense"
                        />
                    </>
                ),
                p: 2,
            },
            {
                label: 'BASE64',
                component: (
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        multiline
                        defaultValue={base64Value}></InputBase>
                ),
            },
        ],
        state,
    }
    const content = (
        <>
            <Typography variant="body1">You can import a persona backup with either way below.</Typography>
            <BackupRestoreTab margin="top" {...tabProps}></BackupRestoreTab>
        </>
    )
    return (
        <DialogContentItem
            title="Import Persona"
            content={content}
            actions={
                <Buttone className="actionButton" variant="contained" color="primary" component={Link} to="../">
                    Import
                </Buttone>
            }></DialogContentItem>
    )
}

export function PersonaImportFailedDialog() {
    return (
        <DialogContentItem
            simplified
            title="Import Failure"
            content="Your import data is invalid. Please check again."
            actions={
                <Buttone className="actionButton" variant="outlined" color="default" component={Link} to="../">
                    Ok
                </Buttone>
            }></DialogContentItem>
    )
}
export function PersonaImportSuccessDialog() {
    return (
        <DialogContentItem
            simplified
            title="Import Successful"
            content={`Imported persona ${`Yisi Liu`} with 2 profiles.`}
            actions={
                <Buttone className="actionButton" variant="outlined" color="default" component={Link} to="../">
                    Ok
                </Buttone>
            }></DialogContentItem>
    )
}
