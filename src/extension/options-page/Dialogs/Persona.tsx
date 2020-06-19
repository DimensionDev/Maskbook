import React, { useState, useEffect } from 'react'

import { TextField } from '@material-ui/core'
import { UserPlus, UserCheck, User, UserMinus } from 'react-feather'

import { useI18N } from '../../../utils/i18n-next-ui'
import Services from '../../service'
import { encodeArrayBuffer, encodeText } from '../../../utils/type-transform/String-ArrayBuffer'
import { compressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { QRCode } from '../../../components/shared/qrcode'
import { useSnackbar } from 'notistack'
import type { Persona } from '../../../database'

import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps, useSnackbarCallback } from './Base'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { DebounceButton } from '../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../DashboardComponents/SpacedButtonGroup'
import ShowcaseBox from '../DashboardComponents/ShowcaseBox'
import { DashboardRoute } from '../Route'
import { useHistory } from 'react-router-dom'
import { RestoreFromQRCodeImageBox } from '../DashboardComponents/RestoreFromQRCodeImageBox'
import { RestoreFromQRCodeCameraBox } from '../DashboardComponents/RestoreFromQRCodeCameraBox'
import { SetupStep } from '../SetupStep'

export function DashboardPersonaCreateDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const [name, setName] = useState('')
    const history = useHistory()

    const createPersonaAndNext = async () => {
        const persona = await Services.Identity.createPersonaByMnemonic(name, '')
        history.push(
            `${DashboardRoute.Setup}/${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(persona.toText())}`,
        )
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<UserPlus />}
                iconColor="#5FDD97"
                primary={t('create_a_persona')}
                secondary={' '}
                content={
                    <>
                        <form>
                            <TextField
                                style={{ marginBottom: 20 }}
                                required
                                label={t('name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        createPersonaAndNext()
                                    }
                                }}
                            />
                        </form>
                    </>
                }
                footer={
                    <DebounceButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={createPersonaAndNext}
                        disabled={!name}>
                        {t('create')}
                    </DebounceButton>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

export function DashboardImportPersonaDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()
    const history = useHistory()

    const [nickname, setNickname] = useState('')
    const [mnemonicWordsValue, setMnemonicWordsValue] = useState('')
    const [password, setPassword] = useState('')
    const [base64Value, setBase64Value] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [scannedValue, setScannedValue] = useState('')

    const importPersona = (persona: null | Persona) => {
        const failToRestore = () => enqueueSnackbar(t('set_up_advance_restore_fail'), { variant: 'error' })
        try {
            if (persona) {
                history.push(
                    `${DashboardRoute.Setup}/${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(
                        persona.identifier.toText(),
                    )}`,
                )
            } else {
                failToRestore()
            }
        } catch (e) {
            failToRestore()
        }
    }

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                id: 'mnemonic',
                label: t('mnemonic_words'),
                children: (
                    <>
                        <TextField
                            onChange={(e) => setNickname(e.target.value)}
                            value={nickname}
                            required
                            label={t('name')}
                            inputProps={{
                                'data-testid': 'username_input',
                            }}
                        />
                        <TextField
                            value={mnemonicWordsValue}
                            onChange={(e) => setMnemonicWordsValue(e.target.value)}
                            required
                            label={t('mnemonic_words')}
                            inputProps={{
                                'data-testid': 'mnemonic_input',
                            }}
                        />
                        <TextField
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            label={t('password')}
                            inputProps={{
                                'data-testid': 'password_input',
                            }}
                        />
                    </>
                ),
                p: 0,
            },
            {
                id: 'text',
                label: 'Base64',
                children: (
                    <TextField
                        inputProps={{ style: { height: 147 } }}
                        multiline
                        rows={1}
                        placeholder={t('dashboard_paste_database_base64_hint')}
                        onChange={(e) => setBase64Value(e.target.value)}
                        value={base64Value}></TextField>
                ),
                display: 'flex',
                p: 0,
            },
            {
                id: 'qr',
                label: t('qr_code'),
                children: (
                    <>
                        <RestoreFromQRCodeImageBox
                            file={file}
                            onChange={setFile}
                            onScan={setScannedValue}
                            onError={() => {
                                enqueueSnackbar(t('set_up_qr_scanner_fail'), {
                                    variant: 'error',
                                })
                            }}
                        />
                        <RestoreFromQRCodeCameraBox
                            onScan={(scannedValue: string) => {
                                setFile(null)
                                setScannedValue(scannedValue)
                            }}
                            onError={() => {
                                enqueueSnackbar(t('set_up_qr_scanner_fail'), {
                                    variant: 'error',
                                })
                            }}
                        />
                    </>
                ),
                p: 0,
            },
        ],
        state,
        height: 176,
    }
    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<UserCheck />}
                iconColor="#5FDD97"
                primary={t('import_your_persona')}
                secondary={t('dashboard_persona_import_dialog_hint')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
                footer={
                    <DebounceButton
                        variant="contained"
                        color="primary"
                        disabled={
                            !(state[0] === 0 && nickname && mnemonicWordsValue) &&
                            !(state[0] === 1 && base64Value) &&
                            !(state[0] === 2 && scannedValue)
                        }
                        onClick={async () => {
                            try {
                                const persona = await (state[0] === 0
                                    ? Services.Identity.restoreFromMnemonicWords(mnemonicWordsValue, nickname, password)
                                    : state[0] === 1
                                    ? Services.Identity.restoreFromBase64(base64Value)
                                    : Services.Identity.restoreFromBackup(scannedValue))

                                importPersona(persona)
                            } catch (e) {
                                enqueueSnackbar(t('set_up_restore_fail'), {
                                    variant: 'error',
                                })
                            }
                        }}
                        data-testid="import_button">
                        {t('import')}
                    </DebounceButton>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}

interface PersonaProps {
    persona: Persona
}

export function DashboardPersonaBackupDialog(props: WrappedDialogProps<PersonaProps>) {
    const { t } = useI18N()
    const { persona } = props.ComponentProps!
    const mnemonicWordsValue = persona.mnemonic?.words ?? t('not_available')
    const [base64Value, setBase64Value] = useState(t('not_available'))
    const [compressedQRString, setCompressedQRString] = useState<string | null>(null)
    useEffect(() => {
        Services.Welcome.generateBackupJSON({
            noPosts: true,
            noUserGroups: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        }).then((file) => {
            setBase64Value(encodeArrayBuffer(encodeText(JSON.stringify(file))))
            setCompressedQRString(
                compressBackupFile(file, {
                    personaIdentifier: persona.identifier,
                }),
            )
        })
    }, [persona.identifier])

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                id: 'mnemonic',
                label: t('mnemonic_words'),
                children: <ShowcaseBox>{mnemonicWordsValue}</ShowcaseBox>,
            },
            {
                id: 'base64',
                label: 'Base64',
                children: <ShowcaseBox>{base64Value}</ShowcaseBox>,
            },
            {
                id: 'qr',
                label: t('qr_code'),
                children: compressedQRString ? (
                    <QRCode
                        text={compressedQRString}
                        options={{ width: 200 }}
                        canvasProps={{
                            style: { display: 'block', margin: 'auto' },
                        }}
                    />
                ) : null,
            },
        ],
        state,
        height: 200,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<User />}
                iconColor="#5FDD97"
                primary={t('backup_persona')}
                secondary={t('dashboard_backup_persona_hint')}
                content={<AbstractTab {...tabProps}></AbstractTab>}></DashboardDialogWrapper>
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
                secondary={t('dashboard_delete_persona_confirm_hint', { name: persona.nickname })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton
                            variant="contained"
                            color="danger"
                            onClick={deletePersona}
                            data-testid="confirm_button">
                            {t('confirm')}
                        </DebounceButton>
                        <DebounceButton variant="outlined" color="primary" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
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
                })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onClick}>
                            {t('confirm')}
                        </DebounceButton>
                        <DebounceButton variant="outlined" color="primary" onClick={props.onClose}>
                            {t('cancel')}
                        </DebounceButton>
                    </SpacedButtonGroup>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
