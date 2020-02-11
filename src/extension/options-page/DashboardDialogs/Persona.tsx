import React, { useState, useEffect, Children } from 'react'
import * as bip39 from 'bip39'
import { DialogContentItem, DialogRouter } from './DialogBase'

import { TextField, Typography, InputBase, makeStyles, TypographyProps } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import ActionButton from '../DashboardComponents/ActionButton'
import { ECKeyIdentifier, Identifier } from '../../../database/type'
import Services from '../../service'
import { Persona } from '../../../database'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync } from '../../../utils/components/AsyncComponent'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useColorProvider } from '../../../utils/theme'
import { geti18nString } from '../../../utils/i18n'
import { QrCode, WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { compressBackupFile, decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import QRScanner from '../../../components/QRScanner'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import {
    encodeText,
    decodeText,
    encodeArrayBuffer,
    decodeArrayBuffer,
} from '../../../utils/type-transform/String-ArrayBuffer'

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
            Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap()).then(setPersona)
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

const ShowcaseBox = (props: TypographyProps) => {
    const { children, ...other } = props
    const ref = React.useRef<HTMLElement>(null)
    const copyText = () => {
        window.getSelection()!.selectAllChildren(ref.current!)
    }
    return (
        <Typography
            variant="body1"
            onClick={copyText}
            ref={ref}
            style={{
                height: '100%',
                overflow: 'auto',
                wordBreak: 'break-all',
                display: 'flex',
            }}
            {...other}>
            <div style={{ margin: 'auto' }}>{children}</div>
        </Typography>
    )
}

export function PersonaBackupDialog(props: PersonaBackupDialogProps) {
    const { onClose, persona } = props
    const mnemonicWordValue = persona.mnemonic?.words ?? geti18nString('not_available')
    const [base64Value, setBase64Value] = useState(geti18nString('not_available'))
    const [compressedQRString, setCompressedQRString] = useState<string | null>(null)
    useEffect(() => {
        Services.Welcome.generateBackupJSON({
            noPosts: true,
            noUserGroups: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        }).then(file => {
            setBase64Value(encodeArrayBuffer(encodeText(JSON.stringify(file))))
            setCompressedQRString(compressBackupFile(file))
        })
    }, [persona.identifier])

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'MNEMONIC WORDS',
                component: <ShowcaseBox>{mnemonicWordValue}</ShowcaseBox>,
            },
            {
                label: 'BASE64',
                component: <ShowcaseBox>{base64Value}</ShowcaseBox>,
            },
            {
                label: 'QR',
                component: compressedQRString ? (
                    <QrCode
                        text={compressedQRString}
                        options={{ width: 260 }}
                        canvasProps={{
                            style: { display: 'block', margin: 'auto' },
                        }}
                    />
                ) : null,
                p: 2,
            },
        ],
        state,
    }
    const content = (
        <>
            <Typography variant="body2">{geti18nString('dashboard_backup_persona_hint')}</Typography>
            <AbstractTab height={292} margin {...tabProps}></AbstractTab>
            <Typography variant="body2">
                {geti18nString(
                    state[0] === 0
                        ? 'dashboard_backup_persona_mnemonic_hint'
                        : state[0] === 1
                        ? 'dashboard_backup_persona_text_hint'
                        : 'dashboard_backup_persona_qr_hint',
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
    const [nickname, setNickname] = useState('')
    const [mnemonicWordValue, setMnemonicWordValue] = useState('')
    const [password, setPassword] = useState('')
    const [base64Value, setBase64Value] = useState('')

    const classes = useImportDialogStyles()

    const history = useHistory()

    const [restoreState, setRestoreState] = React.useState<'success' | 'failed' | null>(null)

    const state = useState(0)
    const [tabState, setTabState] = state

    const importPersona = () => {
        if (tabState === 0) {
            if (!bip39.validateMnemonic(mnemonicWordValue)) return setRestoreState('failed')
            Services.Welcome.restoreNewIdentityWithMnemonicWord(mnemonicWordValue, password, { nickname })
                .then(() => setRestoreState('success'))
                .catch(() => setRestoreState('failed'))
        } else if (tabState === 1) {
            Promise.resolve()
                .then(() => JSON.parse(decodeText(decodeArrayBuffer(base64Value))))
                .then(object => Services.Welcome.restoreBackup(object))
                .then(() => setRestoreState('success'))
                .catch(() => setRestoreState('failed'))
        }
    }

    const importFromQR = (str: string) => {
        Promise.resolve()
            .then(() => UpgradeBackupJSONFile(decompressBackupFile(str)))
            .then(object => Services.Welcome.restoreBackup(object!))
            .then(() => setRestoreState('success'))
            .catch(() => setRestoreState('failed'))
    }

    function QR() {
        const shouldRenderQRComponent = tabState === 2 && !restoreState

        return shouldRenderQRComponent ? (
            hasWKWebkitRPCHandlers ? (
                <WKWebkitQRScanner onScan={importFromQR} onQuit={() => setTabState(0)} />
            ) : (
                <QRScanner
                    onError={() => setRestoreState('failed')}
                    scanning={shouldRenderQRComponent}
                    width="100%"
                    onResult={importFromQR}
                />
            )
        ) : null
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'MNEMONIC WORDS',
                component: (
                    <>
                        <TextField
                            className={classes.input}
                            onChange={e => setNickname(e.target.value)}
                            value={nickname}
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
                        inputRef={(input: HTMLInputElement) => input && input.focus()}
                        multiline
                        onChange={e => setBase64Value(e.target.value)}
                        value={base64Value}></InputBase>
                ),
            },
            {
                label: 'QR',
                component: <QR />,
                p: 0,
            },
        ],
        state,
    }
    const content = (
        <>
            <Typography variant="body1">{geti18nString('dashboard_persona_import_dialog_hint')}</Typography>
            <AbstractTab margin="top" {...tabProps}></AbstractTab>
            {restoreState === 'success' && (
                <DialogRouter
                    fullscreen={false}
                    onExit="/home"
                    children={
                        <PersonaImportSuccessDialog
                            onConfirm={() => history.push('/home')}
                            nickname={tabState === 0 ? nickname : null}
                        />
                    }
                />
            )}
            {restoreState === 'failed' && (
                <DialogRouter
                    fullscreen={false}
                    onExit={() => setRestoreState(null)}
                    children={<PersonaImportFailedDialog onConfirm={() => setRestoreState(null)} />}
                />
            )}
        </>
    )
    return (
        <DialogContentItem
            title={geti18nString('import_persona')}
            content={content}
            actions={
                tabState === 2 ? null : (
                    <ActionButton variant="contained" color="primary" onClick={importPersona}>
                        {geti18nString('import')}
                    </ActionButton>
                )
            }></DialogContentItem>
    )
}

interface PersonaImportFailedDialogProps {
    onConfirm(): void
}

export function PersonaImportFailedDialog(props: PersonaImportFailedDialogProps) {
    const { onConfirm } = props
    return (
        <DialogContentItem
            simplified
            title={geti18nString('import_failed')}
            content={geti18nString('dashboard_import_persona_failed')}
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    {geti18nString('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}

interface PersonaImportSuccessDialogProps {
    nickname: string | null
    profiles?: number | null
    onConfirm(): void
}

export function PersonaImportSuccessDialog(props: PersonaImportSuccessDialogProps) {
    const { nickname, profiles, onConfirm } = props
    return (
        <DialogContentItem
            simplified
            title={geti18nString('import_successful')}
            content={
                nickname
                    ? geti18nString('dashboard_imported_persona', [nickname, '' + (profiles ?? 0)])
                    : geti18nString('dashboard_database_import_successful_hint')
            }
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    {geti18nString('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}
