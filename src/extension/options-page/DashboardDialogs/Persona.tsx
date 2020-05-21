import React, { useState } from 'react'
import * as bip39 from 'bip39'
import { DialogContentItem, DialogRouter } from './DialogBase'

import { TextField, Typography, InputBase } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import ActionButton from '../DashboardComponents/ActionButton'
import Services from '../../service'
import { useI18N } from '../../../utils/i18n-next-ui'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import QRScanner from '../../../components/QRScanner'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import { decodeText, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'

export function PersonaImportDialog() {
    const { t } = useI18N()
    const [nickname, setNickname] = useState('')
    const [mnemonicWordValue, setMnemonicWordValue] = useState('')
    const [password, setPassword] = useState('')
    const [base64Value, setBase64Value] = useState('')

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
                label: 'Mnemonic Words',
                children: (
                    <>
                        <TextField
                            onChange={(e) => setNickname(e.target.value)}
                            value={nickname}
                            required
                            label="Name"
                            margin="dense"
                        />
                        <TextField
                            required
                            value={mnemonicWordValue}
                            onChange={(e) => setMnemonicWordValue(e.target.value)}
                            label="Mnemonic Words"
                            margin="dense"
                        />
                        <TextField
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
                label: 'Base64',
                children: (
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        inputRef={(input: HTMLInputElement) => input && input.focus()}
                        multiline
                        onChange={(e) => setBase64Value(e.target.value)}
                        value={base64Value}></InputBase>
                ),
            },
            {
                label: 'QR Code',
                children: <QR />,
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
