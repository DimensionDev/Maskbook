import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { Box, type BoxProps } from '@mui/system'
import { memo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { fetchDownloadLink } from '../../pages/Settings/api.js'
import { AccountType } from '../../pages/Settings/type.js'
import { Step, Stepper, type StepperProps } from '../Stepper/index.js'
import { ConfirmBackupInfo } from './steps/ConfirmBackupInfo.js'
import { EmailField } from './steps/EmailField.js'
import { LoadingCard } from './steps/LoadingCard.js'
import { PhoneField } from './steps/PhoneField.js'
import { ValidationCodeStep } from './steps/common.js'

const useStyles = makeStyles()((theme) => ({
    purposes: {
        display: 'flex',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    purpose: {
        width: '50%',
        margin: 0,
    },
    control: {
        padding: 0,
        marginRight: theme.spacing(1),
        color: theme.palette.maskColor.second,
    },
    checked: {
        color: theme.palette.maskColor.primary,
        boxShadow: '0px 4px 10px rgba(28, 104, 243, 0.2)',
    },
}))

const StepMap = {
    [AccountType.Email]: ValidationCodeStep.EmailInput,
    [AccountType.Phone]: ValidationCodeStep.PhoneInput,
} as const

interface CodeValidationProps extends BoxProps {
    onValidated(downloadLink: string, account: string, password: string, type: AccountType): Promise<string | null>
}
export const CodeValidation = memo(function CodeValidation({ onValidated, ...rest }: CodeValidationProps) {
    const { classes, theme } = useStyles()
    const [{ loading: fetchingBackupInfo }, fetchDownloadLinkFn] = useAsyncFn(
        (account: string, type: AccountType, code: string) => fetchDownloadLink({ code, account, type }),
        [],
    )
    const [step, setStep] = useState<StepperProps['step']>({ name: ValidationCodeStep.EmailInput })
    const [accountType, setAccountType] = useState(AccountType.Email)

    const showSwitcher = step?.name
        ? [ValidationCodeStep.EmailInput, ValidationCodeStep.PhoneInput].includes(step.name as ValidationCodeStep)
        : false

    return (
        <Box {...rest}>
            {showSwitcher ? (
                <RadioGroup
                    className={classes.purposes}
                    value={accountType}
                    onChange={(e) => {
                        const accountType = e.currentTarget.value as AccountType
                        setStep({ name: StepMap[accountType] })
                        setAccountType(accountType)
                    }}>
                    <FormControlLabel
                        className={classes.purpose}
                        label="E-Mail"
                        value={AccountType.Email}
                        control={
                            <Radio
                                classes={{ root: classes.control, checked: classes.checked }}
                                color="primary"
                                value={AccountType.Email}
                                icon={<Icons.RadioButtonUnChecked color={theme.palette.maskColor.line} size={18} />}
                                checkedIcon={<Icons.RadioButtonChecked size={18} />}
                            />
                        }
                    />
                    <FormControlLabel
                        className={classes.purpose}
                        label="Mobile"
                        value={AccountType.Phone}
                        control={
                            <Radio
                                classes={{ root: classes.control, checked: classes.checked }}
                                color="primary"
                                value={AccountType.Phone}
                                icon={<Icons.RadioButtonUnChecked color={theme.palette.maskColor.line} size={18} />}
                                checkedIcon={<Icons.RadioButtonChecked size={18} />}
                            />
                        }
                    />
                </RadioGroup>
            ) : null}
            <Box mt={2}>
                <Stepper
                    defaultStep={ValidationCodeStep.EmailInput}
                    step={step}
                    onChange={setStep}
                    transition={{ render: <LoadingCard />, trigger: fetchingBackupInfo }}>
                    <Step name={ValidationCodeStep.EmailInput}>
                        {(toStep) => <EmailField toStep={toStep} onNext={fetchDownloadLinkFn} />}
                    </Step>
                    <Step name={ValidationCodeStep.PhoneInput}>
                        {(toStep) => <PhoneField toStep={toStep} onNext={fetchDownloadLinkFn} />}
                    </Step>
                    <Step name={ValidationCodeStep.ConfirmBackupInfo}>
                        {(toStep, { backupInfo, account, type }) => (
                            <ConfirmBackupInfo
                                toStep={toStep}
                                account={account}
                                backupInfo={backupInfo}
                                onNext={(password) => onValidated(backupInfo.downloadURL, account, password, type)}
                                onSwitch={() => setStep({ name: StepMap[type as unknown as keyof typeof StepMap] })}
                            />
                        )}
                    </Step>
                </Stepper>
            </Box>
        </Box>
    )
})
