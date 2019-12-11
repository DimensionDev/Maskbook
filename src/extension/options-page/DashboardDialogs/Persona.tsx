import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { TextField, Typography, InputBase, makeStyles } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import BackupRestoreTab, { BackupRestoreTabProps } from '../DashboardComponents/BackupRestoreTab'
import ActionButton from '../DashboardComponents/ActionButton'
import { ECKeyIdentifier } from '../../../database/type'
import Services from '../../service'
import { Persona } from '../../../database'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync } from '../../../utils/components/AsyncComponent'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useColorProvider } from '../../../utils/theme'
import { geti18nString } from '../../../utils/i18n'

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
                helperText={geti18nString('dashboard_password_helper_text')}
                placeholder={geti18nString('dashboard_password_hint')}
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
        </div>
    )

    return (
        <DialogContentItem
            title={geti18nString('create_persona')}
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" component={'a'} onClick={createPersona}>
                    {geti18nString('create')}
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
            title={geti18nString('dashboard_persona_created')}
            content={
                <>
                    {geti18nString('dashboard_new_persona_created', persona?.nickname)}
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
            title={geti18nString('delete_persona')}
            content={geti18nString('dashboard_delete_persona_confirm_hint', persona?.nickname)}
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={onDecline}>
                        {geti18nString('cancel')}
                    </ActionButton>
                    <ActionButton classes={{ root: color.errorButton }} onClick={deletePersona}>
                        {geti18nString('ok')}
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
    const mnemonicWordValue = persona.mnemonic?.words ?? geti18nString('not_available')
    const base64Value = geti18nString('not_available')

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
            <Typography variant="body2">{geti18nString('dashboard_backup_persona_hint')}</Typography>
            <BackupRestoreTab margin {...tabProps}></BackupRestoreTab>
            <Typography variant="body2">
                {geti18nString(
                    state[0] === 0 ? 'dashboard_backup_persona_mnemonic_hint' : 'dashboard_backup_persona_text_hint',
                )}
            </Typography>
        </>
    )

    return (
        <DialogContentItem
            onExit={onClose}
            title={geti18nString('backup_persona')}
            content={content}></DialogContentItem>
    )
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
    const base64Value = geti18nString('not_available')

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
                            placeholder={geti18nString('dashboard_password_optional_hint')}
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
            <Typography variant="body1">{geti18nString('dashboard_persona_import_dialog_hint')}</Typography>
            <BackupRestoreTab margin="top" {...tabProps}></BackupRestoreTab>
        </>
    )
    return (
        <DialogContentItem
            title={geti18nString('import_persona')}
            content={content}
            actions={
                <ActionButton variant="contained" color="primary" onClick={importPersona}>
                    {geti18nString('import')}
                </ActionButton>
            }></DialogContentItem>
    )
}

export function PersonaImportFailedDialog() {
    return (
        <DialogContentItem
            simplified
            title={geti18nString('import_failed')}
            content={geti18nString('dashboard_import_persona_failed')}
            actions={
                <ActionButton variant="outlined" color="default" component={Link} to="../">
                    {geti18nString('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}
export function PersonaImportSuccessDialog() {
    return (
        <DialogContentItem
            simplified
            title={geti18nString('import_successful')}
            content={geti18nString('dashboard_imported_persona', ['Yisi Liu', '2'])}
            actions={
                <ActionButton variant="outlined" color="default" component={Link} to="../">
                    {geti18nString('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}
