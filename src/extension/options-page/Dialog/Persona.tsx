import React, { useState } from 'react'
import * as bip39 from 'bip39'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from './Base'
import { UserPlus, UserCheck } from 'react-feather'
import { TextField, makeStyles, createStyles, Typography, Button, InputBase } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import Services from '../../service'
import { decodeText, decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import QRScanner from '../../../components/QRScanner'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'

export function DashboardPersonaCreateDialog(props: WrappedDialogProps) {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

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
                <Button type="submit" variant="contained" color="primary">
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
