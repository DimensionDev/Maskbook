import { memo, useState } from 'react'
import { Button, makeStyles, Stack, Typography } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'
import { MaskTextField, PhoneNumberField, PhoneNumberFieldValue, SendingCodeField } from '@masknet/theme'

enum Mode {
    email,
    phone,
}

interface LabelProps {
    onModeChange(mode: Mode): void
    mode: Mode
}

const useStyles = makeStyles((theme) => ({
    label: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
}))

const Label = ({ mode, onModeChange }: LabelProps) => {
    const classes = useStyles()

    return (
        <div className={classes.label}>
            <Typography variant="body2" sx={{ fontWeight: 'bolder' }} color="textPrimary">
                {mode === Mode.email ? 'Email' : 'Phone Number'}
            </Typography>
            {}
            {mode === Mode.email ? (
                <Button size="small" variant="text" onClick={() => onModeChange(Mode.phone)}>
                    Recovery with Mobile
                </Button>
            ) : (
                <Button size="small" variant="text" onClick={() => onModeChange(Mode.email)}>
                    Recovery with Email
                </Button>
            )}
        </div>
    )
}

interface CodeValidationProps {
    onNext(mode: Mode): void
    mode: Mode
}

enum Step {
    input,
    validation,
}

export const CodeValidation = memo(() => {
    const t = useDashboardI18N()
    const [step, setStep] = useState<Step>(Step.input)
    const [mode, setMode] = useState<Mode>(Mode.email)
    const [value, setValue] = useState<string | PhoneNumberFieldValue>('')

    const onNext = () => {
        if (step === Step.input) {
            // send
            setStep(Step.validation)
        }
        if (step === Step.validation) {
            // sendCode
        }
    }

    const onCancel = () => {
        setStep(Step.input)
    }

    const validCheck = () => {}

    return (
        <>
            {step === Step.input &&
                (mode === Mode.email ? (
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
                    onSend={onNext}
                    onBlur={onNext}
                />
            )}
            <Stack direction="row" spacing={2} justifyContent="center">
                <Button sx={{ width: '224px' }} variant="rounded" color="secondary" onClick={onCancel}>
                    {t.cancel()}
                </Button>
                <Button sx={{ width: '224px' }} variant="rounded" color="primary" onClick={onNext} disabled={!value}>
                    {t.next()}
                </Button>
            </Stack>
        </>
    )
})
