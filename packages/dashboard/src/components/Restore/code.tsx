import { memo, useState } from 'react'
import { MaskTextField } from '@masknet/theme'
import { ControlContainer } from './index'
import { Button, makeStyles } from '@material-ui/core'
import { useDashboardI18N } from '../../locales'

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
            <div>{mode === Mode.email ? 'Email' : 'Phone Number'}</div>
            {}
            {mode === Mode.email ? (
                <Button size={'small'} variant={'text'} onClick={() => onModeChange(Mode.phone)}>
                    Recovery with Mobile
                </Button>
            ) : (
                <Button size={'small'} variant={'text'} onClick={() => onModeChange(Mode.email)}>
                    Recovery with Email
                </Button>
            )}
        </div>
    )
}

interface CodeProps {
    onNext(mode: Mode): void
    mode: Mode
}

enum Step {
    input,
    validation,
}

export const Code = memo(() => {
    const t = useDashboardI18N()
    const [step, setStep] = useState<Step>(Step.input)
    const [mode, setMode] = useState<Mode>(Mode.email)
    const [value, setValue] = useState<string>('')

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

    return (
        <div>
            {step === Step.input && (
                <MaskTextField
                    label={<Label onModeChange={(m) => setMode(m)} mode={mode} />}
                    onChange={(e) => setValue(e.currentTarget.value)}
                />
            )}
            {step === Step.validation && (
                <MaskTextField
                    label={`Code has been sent to ${value}`}
                    onChange={(e) => setValue(e.currentTarget.value)}
                />
            )}
            <ControlContainer>
                <Button color="secondary" onClick={onCancel}>
                    {t.cancel()}
                </Button>
                <Button color="primary" onClick={onNext} disabled={!value}>
                    {t.next()}
                </Button>
            </ControlContainer>
        </div>
    )
})
