import React, { useState, useEffect } from 'react'
import * as bip39 from 'bip39'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import { UserPlus, UserCheck, User, UserMinus } from 'react-feather'
import { TextField, makeStyles, createStyles, Typography, Button, TypographyProps } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import Services from '../../service'
import {
    decodeText,
    decodeArrayBuffer,
    encodeArrayBuffer,
    encodeText,
} from '../../../utils/type-transform/String-ArrayBuffer'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { decompressBackupFile, compressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import QRScanner from '../../../components/QRScanner'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { QrCode, WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { useSnackbar } from 'notistack'
import { selectElementContents } from '../../../utils/utils'
import type { Persona } from '../../../database'

export function DashboardPersonaCreateDialog(props: WrappedDialogProps) {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const createPersona = useSnackbarCallback(
        () => Services.Identity.createPersonaByMnemonic(name, password),
        [name, password],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper icon={<UserPlus />} iconColor="#5FDD97" primary="Create a Persona">
                <form>
                    <TextField placeholder="Name*" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField placeholder="Password*" value={password} onChange={(e) => setPassword(e.target.value)} />
                </form>
                <Typography variant="body2" color="textSecondary">
                    Set a password to improve the security level
                </Typography>
                <Button type="submit" variant="contained" color="primary" onClick={createPersona}>
                    Create
                </Button>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

const useStyles = makeStyles((theme) =>
    createStyles({
        textarea: {
            height: 'auto',
            '& > *, & textarea': {
                height: '100%',
            },
        },
    }),
)

export function DashboardPersonaImportDialog(props: WrappedDialogProps) {
    const { t } = useI18N()

    const classes = useStyles()

    const [nickname, setNickname] = useState('')
    const [mnemonicWordValue, setMnemonicWordValue] = useState('')
    const [password, setPassword] = useState('')
    const [base64Value, setBase64Value] = useState('')

    const state = useState(0)
    const [tabState, setTabState] = state

    const { enqueueSnackbar } = useSnackbar()

    const importPersona = useSnackbarCallback<any>(
        async () => {
            if (tabState === 0) {
                if (!bip39.validateMnemonic(mnemonicWordValue)) throw new Error('the mnemonic word is not valid')
                // TODO!: not work
                return Services.Welcome.restoreNewIdentityWithMnemonicWord(mnemonicWordValue, password, { nickname })
            }
            const object = JSON.parse(decodeText(decodeArrayBuffer(base64Value)))
            return Services.Welcome.restoreBackup(object)
        },
        [mnemonicWordValue, password, nickname, base64Value],
        props.onClose,
    )

    const importFromQR = (str: string) => {
        Promise.resolve()
            .then(() => UpgradeBackupJSONFile(decompressBackupFile(str)))
            .then((object) => Services.Welcome.restoreBackup(object!))
    }

    function QR() {
        const shouldRenderQRComponent = tabState === 2

        return shouldRenderQRComponent ? (
            hasWKWebkitRPCHandlers ? (
                <WKWebkitQRScanner onScan={importFromQR} onQuit={() => setTabState(0)} />
            ) : (
                <QRScanner
                    onError={() => enqueueSnackbar('QRCode scan Failed')}
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
                label: 'Mnemonic Word',
                children: (
                    <>
                        <TextField onChange={(e) => setNickname(e.target.value)} value={nickname} placeholder="Name*" />
                        <TextField
                            value={mnemonicWordValue}
                            onChange={(e) => setMnemonicWordValue(e.target.value)}
                            placeholder="Mnemonic Words*"
                        />
                        <TextField
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Password"
                        />
                    </>
                ),
                p: 0,
            },
            {
                label: 'Base64',
                children: (
                    <TextField
                        className={classes.textarea}
                        multiline
                        rows={1}
                        placeholder="Input the base64 code"
                        onChange={(e) => setBase64Value(e.target.value)}
                        value={base64Value}></TextField>
                ),
                display: 'flex',
                p: 0,
            },
            {
                label: 'QR Code',
                children: <QR />,
                p: 0,
            },
        ],
        state,
        height: 240,
    }
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<UserCheck />}
                iconColor="#5FDD97"
                primary="Import Your Persona"
                secondary="You can import a persona backup in the following ways.">
                <AbstractTab {...tabProps}></AbstractTab>
                <Button hidden={tabState === 2} variant="contained" color="primary" onClick={importPersona}>
                    {t('import')}
                </Button>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

const ShowcaseBox = (props: TypographyProps) => {
    const { children, ...other } = props
    const ref = React.useRef<HTMLElement>(null)
    const copyText = () => selectElementContents(ref.current!)
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

interface PersonaProps {
    persona: Persona
}

export function DashboardPersonaBackupDialog(props: WrappedDialogProps<PersonaProps>) {
    const { t } = useI18N()
    const { persona } = props.ComponentProps!
    const mnemonicWordValue = persona.mnemonic?.words ?? t('not_available')
    const [base64Value, setBase64Value] = useState(t('not_available'))
    const [compressedQRString, setCompressedQRString] = useState<string | null>(null)
    useEffect(() => {
        Services.Welcome.generateBackupJSON({
            noPosts: true,
            noUserGroups: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        }).then((file) => {
            setBase64Value(encodeArrayBuffer(encodeText(JSON.stringify(file))))
            setCompressedQRString(compressBackupFile(file))
        })
    }, [persona.identifier])

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Mnemonic Word',
                children: <ShowcaseBox>{mnemonicWordValue}</ShowcaseBox>,
            },
            {
                label: 'Base64',
                children: <ShowcaseBox>{base64Value}</ShowcaseBox>,
            },
            {
                label: 'QR Code',
                children: compressedQRString ? (
                    <QrCode
                        text={compressedQRString}
                        options={{ width: 200 }}
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

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<User />}
                iconColor="#5FDD97"
                primary="Backup Persona"
                secondary={t('dashboard_backup_persona_hint')}>
                <AbstractTab height={240} margin {...tabProps}></AbstractTab>
                {// TODO!: ?
                false && (
                    <Typography variant="body2" color="textSecondary">
                        {t(
                            state[0] === 0
                                ? 'dashboard_backup_persona_mnemonic_hint'
                                : state[0] === 1
                                ? 'dashboard_backup_persona_text_hint'
                                : 'dashboard_backup_persona_qr_hint',
                        )}
                    </Typography>
                )}
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardPersonaDeleteConfirmDialog(props: WrappedDialogProps<PersonaProps>) {
    const { t } = useI18N()
    const { persona } = props.ComponentProps!
    const deletePersona = useSnackbarCallback(
        () => Services.Identity.deletePersona(persona.identifier, 'delete even with private'),
        [],
        props.onClose,
    )
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<UserMinus />}
                iconColor="#F4637D"
                primary={t('delete_persona')}
                secondary={t('dashboard_delete_persona_confirm_hint', { name: persona.nickname })}>
                <Button variant="contained" color="primary" onClick={deletePersona}>
                    OK
                </Button>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardPersonaUnlinkConfirmDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { nickname, identifier } = props.ComponentProps!

    const onClick = useSnackbarCallback(() => Services.Identity.detachProfile(identifier), [identifier], props.onClose)

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<UserMinus />}
                iconColor="#699CF7"
                primary={t('disconnect_profile')}
                secondary={t('dashboard_disconnect_profile_hint', {
                    persona: nickname,
                    network: identifier.network,
                    profile: identifier.userId,
                })}>
                <Button variant="contained" color="primary" onClick={onClick}>
                    {t('ok')}
                </Button>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
