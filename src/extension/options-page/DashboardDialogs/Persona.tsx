import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, InputBase, makeStyles } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import BackupRestoreTab, { BackupRestoreTabProps } from '../DashboardComponents/BackupRestoreTab'
import ActionButton from '../../../components/Dashboard/ActionButton'
import { ECKeyIdentifier, ProfileIdentifier } from '../../../database/type'
import Services from '../../service'
import { Persona } from '../../../database'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync } from '../../../utils/components/AsyncComponent'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useColorProvider } from '../../../utils/theme'

export function PersonaCreateDialog() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const history = useHistory()

    const createPersona = () => {
        Services.Identity.createPersonaByMnemonic(name, password).then(persona => {
            history.replace(`created?identifier=${encodeURIComponent(persona.toText())}`)
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
    onDecline(): void
    onConfirm(): void
    persona: Persona
}
export function PersonaDeleteDialog(props: PersonaDeleteDialogProps) {
    const { onConfirm, onDecline, persona } = props
    const color = useColorProvider()

    const deletePersona = () => {
        Services.Identity.deletePersona(persona.identifier, 'delete even with private').then(onConfirm)
    }

    return (
        <DialogContentItem
            simplified
            title="Delete Persona"
            content={`Do you really want to delete persona "${persona?.nickname}"? This operation cannot be reverted.`}
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={onDecline}>
                        Cancel
                    </ActionButton>
                    <ActionButton classes={{ root: color.errorButton }} onClick={deletePersona}>
                        Ok
                    </ActionButton>
                </>
            }></DialogContentItem>
    )
}

interface PersonaBackupDialogProps {
    onClose(): void
    persona: Persona
}

export function PersonaBackupDialog(props: PersonaBackupDialogProps) {
    const { onClose, persona } = props
    const mnemonicWordValue = persona.mnemonic?.words ?? 'not available'
    const base64Value = 'not available'

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
            <BackupRestoreTab margin {...tabProps}></BackupRestoreTab>
            <Typography variant="body2">
                {state[0] === 0
                    ? 'Keep the 12 words above carefully in a safe place. You will need them to restore the private key of this persona.'
                    : 'Keep the text above carefully in a safe place. You will need them to restore the private key of this persona.'}
            </Typography>
        </>
    )

    return <DialogContentItem onExit={onClose} title="Backup Persona" content={content}></DialogContentItem>
}

const useImportDialogStyles = makeStyles({
    input: {
        width: '100%',
    },
})

export function PersonaImportDialog() {
    const [name, setName] = useState('')
    const [mnemonicWordValue, setMnemonicWordValue] = useState('')
    const [password, setPassword] = useState('')
    const base64Value = 'not available'

    const classes = useImportDialogStyles()

    const history = useHistory()

    const importPersona = () => {
        // FIXME:
        alert('dummy method')
        // const persona = ProfileIdentifier.fromString(name) as ProfileIdentifier | null
        // Services.Welcome.restoreNewIdentityWithMnemonicWord(persona, mnemonicWordValue, password).then(() =>
        //     history.push('../'),
        // )
    }

    const state = useState(0)
    const tabProps: BackupRestoreTabProps = {
        tabs: [
            {
                label: 'MNEMONIC WORDS',
                component: (
                    <>
                        <TextField
                            className={classes.input}
                            onChange={e => setName(e.target.value)}
                            value={name}
                            required
                            label="Name"
                            margin="dense"
                        />
                        <TextField
                            className={classes.input}
                            required
                            value={mnemonicWordValue}
                            onChange={e => setMnemonicWordValue(e.target.value)}
                            label="Mnemonic Words"
                            margin="dense"
                        />
                        <TextField
                            className={classes.input}
                            onChange={e => setPassword(e.target.value)}
                            value={password}
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
                <ActionButton variant="contained" color="primary" onClick={importPersona}>
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
