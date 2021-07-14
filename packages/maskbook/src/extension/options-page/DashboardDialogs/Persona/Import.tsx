import { TextField } from '@material-ui/core'
import { useSnackbar } from '@masknet/theme'
import { useState } from 'react'
import { UserCheck } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../../utils'
import type { Persona } from '../../../../database'
import Services from '../../../service'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { RestoreFromQRCodeCameraBox } from '../../DashboardComponents/RestoreFromQRCodeCameraBox'
import { RestoreFromQRCodeImageBox } from '../../DashboardComponents/RestoreFromQRCodeImageBox'
import { DashboardRoute } from '../../Route'
import { SetupStep } from '../../SetupStep'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'

export function DashboardImportPersonaDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()
    const history = useHistory<unknown>()

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
                            autoFocus
                            required
                            label={t('name')}
                            inputProps={{
                                'data-testid': 'username_input',
                            }}
                            variant="outlined"
                        />
                        <TextField
                            value={mnemonicWordsValue}
                            onChange={(e) => setMnemonicWordsValue(e.target.value)}
                            required
                            label={t('mnemonic_words')}
                            inputProps={{
                                'data-testid': 'mnemonic_input',
                            }}
                            variant="outlined"
                        />
                        <TextField
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            label={t('password')}
                            inputProps={{
                                'data-testid': 'password_input',
                            }}
                            variant="outlined"
                        />
                    </>
                ),
                sx: { p: 0 },
            },
            {
                id: 'text',
                label: 'Base64',
                children: (
                    <TextField
                        multiline
                        minRows={5}
                        maxRows={5}
                        autoFocus
                        placeholder={t('dashboard_paste_database_base64_hint')}
                        onChange={(e) => setBase64Value(e.target.value)}
                        value={base64Value}
                        variant="outlined"
                    />
                ),
                sx: { p: 0, display: 'flex' },
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
                sx: { p: 0 },
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
                content={<AbstractTab {...tabProps} />}
                footer={
                    <DebounceButton
                        variant="contained"
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
                }
            />
        </DashboardDialogCore>
    )
}
