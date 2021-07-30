import { memo, useState } from 'react'
import { Box, Button, Card, Stack, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskTextField, PhoneNumberField, PhoneNumberFieldValue, SendingCodeField } from '@masknet/theme'
import { ButtonGroup } from '../RegisterFrame/ButtonGroup'
import { fetchDownloadLink, sendCode } from '../../pages/Settings/api'
import { BackupInfo } from './BackupInfo'
import { useAsyncFn } from 'react-use'

interface LabelProps {
    onModeChange(mode: AccountValidationType): void
    mode: AccountValidationType
}

const Label = ({ mode, onModeChange }: LabelProps) => {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 'bolder' }} color="textPrimary">
                {mode === 'email' ? 'Email' : 'Phone Number'}
            </Typography>
            {mode === 'email' ? (
                <Button size="small" variant="text" onClick={() => onModeChange('phone')}>
                    Recovery with Mobile
                </Button>
            ) : (
                <Button size="small" variant="text" onClick={() => onModeChange('email')}>
                    Recovery with Email
                </Button>
            )}
        </Stack>
    )
}

enum Step {
    input,
    validation,
    confirm,
}

interface CodeValidationProps {
    onValidated(downloadLink: string, account: string, password: string): void
}

const getAccountValue = (value: string | PhoneNumberFieldValue) => {
    return typeof value === 'string' ? (value as string) : ((value.country + value.phone) as string)
}

export const CodeValidation = memo(({ onValidated }: CodeValidationProps) => {
    const t = useDashboardI18N()
    const [step, setStep] = useState<Step>(Step.input)
    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [mode, setMode] = useState<AccountValidationType>('email')
    const [account, setAccount] = useState<string | PhoneNumberFieldValue>('')

    const [{ loading: fetchingBackupInfo, error: fetchBackupInfoError, value: backupInfo }, fetchDownloadLinkFn] =
        useAsyncFn(async () => {
            return fetchDownloadLink({ code, account: getAccountValue(account), type: mode })
        }, [account, mode, code])

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        return sendCode({ account: getAccountValue(account), type: mode })
    }, [account, mode])

    const onNext = async () => {
        if (step === Step.input) {
            setStep(Step.validation)
        }
        if (step === Step.validation) {
            // validate code in number
            await fetchDownloadLinkFn()
            setStep(Step.confirm)
        }
        if (step === Step.confirm) {
            if (!backupInfo || !password) return
            onValidated(backupInfo?.downloadURL, getAccountValue(account), password)
        }
    }

    const onCancel = () => {
        setStep(Step.input)
    }

    const isDisableNext = () => {
        switch (step) {
            case Step.confirm:
                return !password
            case Step.input:
                return !account
            case Step.validation:
                return !!fetchBackupInfoError || !!sendCodeError || !code
            default:
                return false
        }
    }

    return (
        <>
            {step === Step.input &&
                (mode === 'email' ? (
                    <MaskTextField
                        label={<Label onModeChange={setMode} mode={mode} />}
                        fullWidth
                        value={account}
                        onChange={(event) => setAccount(event.target.value)}
                        type="email"
                        variant="outlined"
                    />
                ) : (
                    <PhoneNumberField
                        label={<Label onModeChange={setMode} mode={mode} />}
                        value={{
                            country: '+1',
                            phone: '',
                        }}
                    />
                ))}
            {step === Step.validation && (
                <SendingCodeField
                    label={
                        <Typography variant="body2" sx={{ fontWeight: 'bolder' }} color="textPrimary">
                            Send to {account}
                        </Typography>
                    }
                    onChange={(c) => setCode(c)}
                    // todo : message
                    errorMessage={
                        (sendCodeError && sendCodeError.message) ||
                        (fetchBackupInfoError && fetchBackupInfoError.message)
                    }
                    onSend={handleSendCodeFn}
                />
            )}
            {step === Step.confirm && backupInfo && (
                <Box>
                    <BackupInfo info={backupInfo} />
                    <Box sx={{ mt: 4 }}>
                        <MaskTextField
                            label="Backup Password"
                            type="password"
                            onChange={(e) => setPassword(e.currentTarget.value)}
                        />
                    </Box>
                </Box>
            )}
            {fetchingBackupInfo && (
                // todo: add loading icon
                <Card variant="background">
                    <Stack justifyContent="center" alignItems="center" sx={{ minHeight: 140 }}>
                        Loading
                    </Stack>
                </Card>
            )}
            <ButtonGroup>
                <Button variant="rounded" color="secondary" onClick={onCancel}>
                    {t.cancel()}
                </Button>
                <Button variant="rounded" color="primary" onClick={onNext} disabled={isDisableNext()}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    )
})
