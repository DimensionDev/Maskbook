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

interface CodeValidationProps {
    onNext(mode: AccountValidationType): void
    mode: AccountValidationType
}

enum Step {
    input,
    validation,
    fetchingBackupInfo,
    confirm,
}

const getAccountValue = (value: string | PhoneNumberFieldValue) => {
    return typeof value === 'string' ? (value as string) : ((value.country + value.phone) as string)
}

export const CodeValidation = memo(() => {
    const t = useDashboardI18N()
    const [step, setStep] = useState<Step>(Step.input)
    const [code, setCode] = useState('')
    const [mode, setMode] = useState<AccountValidationType>('email')
    const [value, setValue] = useState<string | PhoneNumberFieldValue>('')

    const [{ loading: fetchingBackupInfo, error: fetchBackupInfoError, value: backupInfo }, fetchDownloadLinkFn] =
        useAsyncFn(async () => {
            return fetchDownloadLink({ code, account: getAccountValue(value), type: mode })
        }, [value, mode, code])

    const [{ error: sendCodeError }, handleSendCodeFn] = useAsyncFn(async () => {
        return sendCode({ account: getAccountValue(value), type: mode })
    }, [value, mode])

    const onNext = async () => {
        if (step === Step.input) {
            setStep(Step.validation)
        }
        if (step === Step.validation) {
            // validate code in number
            await fetchDownloadLinkFn()
        }
    }

    const onCancel = () => {
        setStep(Step.input)
    }

    const validCheck = () => {}

    return (
        <>
            {step === Step.input &&
                (mode === 'email' ? (
                    <MaskTextField
                        label={<Label onModeChange={setMode} mode={mode} />}
                        fullWidth
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        onBlur={validCheck}
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
                        onBlur={validCheck}
                    />
                ))}
            {step === Step.validation && (
                <SendingCodeField
                    label={
                        <Typography variant="body2" sx={{ fontWeight: 'bolder' }} color="textPrimary">
                            Send to {value}
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
                        <MaskTextField label="Backup Password" type="password" />
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
                <Button variant="rounded" color="primary" onClick={onNext} disabled={!value}>
                    {t.next()}
                </Button>
            </ButtonGroup>
        </>
    )
})
