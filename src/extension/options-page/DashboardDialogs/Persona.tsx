import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, InputBase, makeStyles } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import BackupRestoreTab, { BackupRestoreTabProps } from '../DashboardComponents/BackupRestoreTab'
import ActionButton from '../../../components/Dashboard/ActionButton'
import { ECKeyIdentifier } from '../../../database/type'
import Services from '../../service'
import { Persona } from '../../../database'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync } from '../../../utils/components/AsyncComponent'
import ProfileBox from '../DashboardComponents/ProfileBox'

export function PersonaCreateDialog() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const history = useHistory()

    const createPersona = () => {
        Services.Identity.createPersonaByMnemonic(name, password).then(persona => {
            history.replace(`created?identifier=${persona.toText()}`)
        })
    }

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                required
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                helperText=" "
                label="Name"
            />
            <TextField
                required
                type="password"
                style={{ width: '100%', maxWidth: '320px' }}
                variant="outlined"
                label="Password"
                helperText="Set a password to improve security level"
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
        </div>
    )

    return (
        <DialogContentItem
            title="Create Persona"
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" component={'a'} onClick={createPersona}>
                    Create
                </ActionButton>
            }></DialogContentItem>
    )
}

export function PersonaCreatedDialog() {
    const { identifier } = useQueryParams(['identifier'])
    const [persona, setPersona] = useState<Persona | null>(null)
    useAsync(async () => {
        if (identifier)
            Services.Identity.queryPersona(ECKeyIdentifier.fromString(identifier!)! as ECKeyIdentifier).then(setPersona)
    }, [identifier])
    return (
        <DialogContentItem
            title="Persona Created"
            content={
                <>
                    {`New persona «${persona?.nickname}» has been created. Connect a profile now! ([I:b])`}
                    <section style={{ marginTop: 12 }}>
                        <ProfileBox persona={persona} />
                    </section>
                </>
            }></DialogContentItem>
    )
}
interface PersonaDeleteDialogProps {
    declined(): void
    confirmed(): void
    persona: Persona
}
export function PersonaDeleteDialog(props: PersonaDeleteDialogProps) {
    const { confirmed, declined, persona } = props

    const deletePersona = () => {
        Services.Identity.deletePersona(persona.identifier, 'delete even with private').then(confirmed)
    }

    return (
        <DialogContentItem
            simplified
            title="Delete Persona"
            content={`Do you really want to delete persona "${persona?.nickname}"? This operation cannot be reverted.`}
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={declined}>
                        Cancel
                    </ActionButton>
                    <ActionButton variant="contained" color="primary" onClick={deletePersona}>
                        Ok
                    </ActionButton>
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
                <ActionButton variant="contained" color="primary" component={Link} to="../">
                    Import
                </ActionButton>
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
                <ActionButton variant="outlined" color="default" component={Link} to="../">
                    Ok
                </ActionButton>
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
                <ActionButton variant="outlined" color="default" component={Link} to="../">
                    Ok
                </ActionButton>
            }></DialogContentItem>
    )
}
