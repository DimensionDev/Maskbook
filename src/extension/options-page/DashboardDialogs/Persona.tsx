import React, { useState } from 'react'
import { useAsync, useMultiStateValidator } from 'react-use'
import * as bip39 from 'bip39'
import { DialogContentItem, DialogRouter } from './DialogBase'

import { TextField, Typography, InputBase, makeStyles, TypographyProps } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import ActionButton from '../DashboardComponents/ActionButton'
import { ECKeyIdentifier, Identifier } from '../../../database/type'
import Services from '../../service'
import type { Persona } from '../../../database'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import ProfileBox from '../DashboardComponents/ProfileBox'
import { useColorProvider } from '../../../utils/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
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
import { selectElementContents } from '../../../utils/utils'

export function PersonaCreateDialog() {
    const { t } = useI18N()
    const [name, setName] = useState('')
    const history = useHistory()

    //#region validation
    type ValidationResult = [boolean, string]
    type ValidationState = [string]
    const [[isValid, nameErrorMessage]] = useMultiStateValidator<ValidationResult, ValidationState, ValidationResult>(
        [name],
        ([name]: ValidationState): ValidationResult => [Boolean(name), name ? '' : t('error_name_absent')],
    )
    const [submitted, setSubmitted] = useState(false)
    //#endregion

    const createPersona = () => {
        setSubmitted(true)
        if (!isValid) return
        Services.Identity.createPersonaByMnemonic(name, '').then((persona) => {
            history.replace(`created?identifier=${encodeURIComponent(persona.toText())}`)
        })
    }
    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                required
                error={submitted && Boolean(nameErrorMessage)}
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText={(submitted && nameErrorMessage) || ' '}
                label="Name"
            />
        </div>
    )

    return (
        <DialogContentItem
            title={t('create_persona')}
            content={content}
            actionsAlign="center"
            actions={
                <ActionButton variant="contained" color="primary" component={'a'} onClick={createPersona}>
                    {t('create')}
                </ActionButton>
            }></DialogContentItem>
    )
}

export function PersonaCreatedDialog() {
    const { t } = useI18N()
    const { identifier } = useQueryParams(['identifier'])
    const { value: persona = null } = useAsync(async () => {
        if (identifier) {
            return Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap())
        }
        return null
    }, [identifier])
    return (
        <DialogContentItem
            title={t('dashboard_persona_created')}
            content={
                <>
                    <Typography variant="body1">
                        {t('dashboard_new_persona_created', { name: persona?.nickname })}
                    </Typography>
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
    const { t } = useI18N()
    const { onConfirm, onDecline, persona } = props
    const color = useColorProvider()

    const deletePersona = () => {
        Services.Identity.deletePersona(persona.identifier, 'delete even with private').then(onConfirm)
    }

    return (
        <DialogContentItem
            simplified
            title={t('delete_persona')}
            content={
                <Typography variant="body1">
                    {t('dashboard_delete_persona_confirm_hint', { name: persona?.nickname })}
                </Typography>
            }
            actions={
                <>
                    <ActionButton variant="outlined" color="default" onClick={onDecline}>
                        {t('cancel')}
                    </ActionButton>
                    <ActionButton classes={{ root: color.errorButton }} onClick={deletePersona}>
                        {t('ok')}
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
        selectElementContents(ref.current!)
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
    const { t } = useI18N()
    const { onClose, persona } = props
    const mnemonicWordValue = persona.mnemonic?.words ?? t('not_available')
    const [base64Value, setBase64Value] = useState(t('not_available'))
    const [compressedQRString, setCompressedQRString] = useState<string | null>(null)
    useAsync(async () => {
        const file = await Services.Welcome.generateBackupJSON({
            noPosts: true,
            noUserGroups: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        })
        setBase64Value(encodeArrayBuffer(encodeText(JSON.stringify(file))))
        setCompressedQRString(
            compressBackupFile(file, {
                personaIdentifier: persona.identifier,
            }),
        )
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
            <Typography variant="body2">{t('dashboard_backup_persona_hint')}</Typography>
            <AbstractTab height={292} margin {...tabProps}></AbstractTab>
            <Typography variant="body2">
                {t(
                    state[0] === 0
                        ? 'dashboard_backup_persona_mnemonic_hint'
                        : state[0] === 1
                        ? 'dashboard_backup_persona_text_hint'
                        : 'dashboard_backup_persona_qr_hint',
                )}
            </Typography>
        </>
    )

    return <DialogContentItem onExit={onClose} title={t('backup_persona')} content={content}></DialogContentItem>
}

const useImportDialogStyles = makeStyles({
    input: {
        width: '100%',
    },
})

export function PersonaImportDialog() {
    const { t } = useI18N()
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
                .then((object) => Services.Welcome.restoreBackup(object))
                .then(() => setRestoreState('success'))
                .catch(() => setRestoreState('failed'))
        }
    }

    const importFromQR = (str: string) => {
        Promise.resolve()
            .then(() => UpgradeBackupJSONFile(decompressBackupFile(str)))
            .then((object) => Services.Welcome.restoreBackup(object!))
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
                            onChange={(e) => setNickname(e.target.value)}
                            value={nickname}
                            required
                            label="Name"
                            margin="dense"
                        />
                        <TextField
                            className={classes.input}
                            required
                            value={mnemonicWordValue}
                            onChange={(e) => setMnemonicWordValue(e.target.value)}
                            label="Mnemonic Words"
                            margin="dense"
                        />
                        <TextField
                            className={classes.input}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            label="Password"
                            placeholder={t('dashboard_password_optional_hint')}
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
                        onChange={(e) => setBase64Value(e.target.value)}
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
            <Typography variant="body1">{t('dashboard_persona_import_dialog_hint')}</Typography>
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
            title={t('import_persona')}
            content={content}
            actions={
                tabState === 2 ? null : (
                    <ActionButton variant="contained" color="primary" onClick={importPersona}>
                        {t('import')}
                    </ActionButton>
                )
            }></DialogContentItem>
    )
}

interface PersonaImportFailedDialogProps {
    onConfirm(): void
}

export function PersonaImportFailedDialog(props: PersonaImportFailedDialogProps) {
    const { t } = useI18N()
    const { onConfirm } = props
    return (
        <DialogContentItem
            simplified
            title={t('import_failed')}
            content={<Typography variant="body1">{t('dashboard_import_persona_failed')}</Typography>}
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    {t('ok')}
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
    const { t } = useI18N()
    const { nickname, profiles, onConfirm } = props
    return (
        <DialogContentItem
            simplified
            title={t('import_successful')}
            content={
                <Typography variant="body1">
                    {nickname
                        ? t('dashboard_imported_persona', { name: nickname, count: profiles ?? 0 })
                        : t('dashboard_database_import_successful_hint')}
                </Typography>
            }
            actions={
                <ActionButton variant="outlined" color="default" onClick={onConfirm}>
                    {t('ok')}
                </ActionButton>
            }></DialogContentItem>
    )
}
