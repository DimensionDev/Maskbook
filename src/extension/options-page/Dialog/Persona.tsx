import React, { useState, useEffect } from 'react'

import { TextField, makeStyles, createStyles, Typography, TypographyProps } from '@material-ui/core'
import { UserPlus, UserCheck, User, UserMinus } from 'react-feather'

import * as bip39 from 'bip39'
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
import { QrCode, WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { useSnackbar } from 'notistack'
import { selectElementContents } from '../../../utils/utils'
import type { Persona } from '../../../database'

import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { ThrottledButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'

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
                <ThrottledButton type="submit" variant="contained" color="primary" onClick={createPersona}>
                    Create
                </ThrottledButton>
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
                <ThrottledButton hidden={tabState === 2} variant="contained" color="primary" onClick={importPersona}>
                    {t('import')}
                </ThrottledButton>
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
                <SpacedButtonGroup>
                    <ThrottledButton variant="contained" color="danger" onClick={deletePersona}>
                        OK
                    </ThrottledButton>
                    <ThrottledButton variant="outlined" color="primary" onClick={props.onClose}>
                        Cancel
                    </ThrottledButton>
                </SpacedButtonGroup>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

const LinkOffIcon = () => (
    <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M43.7853 35.3366L50.1249 29C52.9203 26.1956 54.49 22.3973 54.49 18.4376C54.49 14.4778 52.9203 10.6796 50.1249 7.87514C47.3212 5.07823 43.5226 3.50751 39.5624 3.50751C35.6022 3.50751 31.8037 5.07823 29 7.87514L26.8878 9.98733L31.1122 14.2117L33.2244 12.0995C34.9079 10.4235 37.1868 9.48252 39.5624 9.48252C41.938 9.48252 44.2169 10.4235 45.9005 12.0995C47.578 13.7823 48.5199 16.0615 48.5199 18.4376C48.5199 20.8137 47.578 23.0928 45.9005 24.7756L39.5609 31.1122C38.835 31.8333 37.9796 32.4111 37.0395 32.8151L33.2244 29L37.4487 24.7756L35.3366 22.6634C33.9532 21.2716 32.3075 20.1681 30.4947 19.4168C28.6818 18.6655 26.738 18.2814 24.7756 18.2867C24.0736 18.2867 23.3894 18.3823 22.7112 18.4839L4.22437 0L0 4.22437L53.7756 58L58 53.7756L41.461 37.2366C42.2885 36.6869 43.0683 36.0536 43.7853 35.3366ZM24.7756 45.9005C23.0921 47.5765 20.8132 48.5175 18.4376 48.5175C16.062 48.5175 13.7831 47.5765 12.0995 45.9005C10.422 44.2177 9.48006 41.9385 9.48006 39.5624C9.48006 37.1863 10.422 34.9072 12.0995 33.2244L16.5091 28.8178L12.2847 24.5934L7.87514 29C5.07969 31.8044 3.50997 35.6027 3.50997 39.5624C3.50997 43.5222 5.07969 47.3204 7.87514 50.1249C9.26098 51.5127 10.9074 52.613 12.7198 53.3625C14.5322 54.1121 16.4748 54.4962 18.4361 54.4926C20.3979 54.4967 22.3411 54.1129 24.1541 53.3633C25.967 52.6138 27.6139 51.5132 29 50.1249L31.1122 48.0127L26.8878 43.7883L24.7756 45.9005Z"
            fill="#F4637D"
        />
    </svg>
)

export function DashboardPersonaUnlinkConfirmDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { nickname, identifier } = props.ComponentProps!

    const onClick = useSnackbarCallback(() => Services.Identity.detachProfile(identifier), [identifier], props.onClose)

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<LinkOffIcon />}
                iconColor="#699CF7"
                primary={t('disconnect_profile')}
                secondary={t('dashboard_disconnect_profile_hint', {
                    persona: nickname,
                    network: identifier.network,
                    profile: identifier.userId,
                })}>
                <SpacedButtonGroup>
                    <ThrottledButton variant="contained" color="danger" onClick={onClick}>
                        {t('ok')}
                    </ThrottledButton>
                    <ThrottledButton variant="outlined" color="primary" onClick={props.onClose}>
                        Cancel
                    </ThrottledButton>
                </SpacedButtonGroup>
            </DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
