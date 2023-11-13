import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, FormControlLabel, Radio, RadioGroup, type BoxProps } from '@mui/material'
import { memo, useState } from 'react'
import { BackupAccountType } from '@masknet/shared-base'
import { RestoreContext } from './RestoreProvider.js'
import { EmailField } from './EmailField.js'
import { PhoneField } from './PhoneField.js'
import { RestoreStep } from './restoreReducer.js'

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
    selectedLabel: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    label: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    checked: {
        color: theme.palette.maskColor.primary,
        boxShadow: '0px 4px 10px rgba(28, 104, 243, 0.2)',
    },
}))

const StepMap = {
    [BackupAccountType.Email]: RestoreStep.InputEmail,
    [BackupAccountType.Phone]: RestoreStep.InputPhone,
} as const

export const InputForm = memo(function InputForm(props: BoxProps) {
    const { classes, theme } = useStyles()
    const { state, dispatch } = RestoreContext.useContainer()
    const [accountType, setAccountType] = useState(BackupAccountType.Email)

    if (![RestoreStep.InputEmail, RestoreStep.InputPhone].includes(state.step)) return null

    return (
        <Box {...props}>
            <RadioGroup
                className={classes.purposes}
                value={accountType}
                onChange={(e) => {
                    const accountType = e.currentTarget.value as BackupAccountType
                    dispatch({ type: 'TO_STEP', step: StepMap[accountType] })
                    dispatch({ type: 'SET_ACCOUNT_TYPE', accountType })
                    setAccountType(accountType)
                }}>
                <FormControlLabel
                    className={classes.purpose}
                    classes={{
                        label: state.accountType === BackupAccountType.Email ? classes.selectedLabel : classes.label,
                    }}
                    label="E-Mail"
                    value={BackupAccountType.Email}
                    control={
                        <Radio
                            classes={{ root: classes.control, checked: classes.checked }}
                            color="primary"
                            value={BackupAccountType.Email}
                            icon={<Icons.RadioButtonUnChecked color={theme.palette.maskColor.line} size={18} />}
                            checkedIcon={<Icons.RadioButtonChecked size={18} />}
                        />
                    }
                />
                <FormControlLabel
                    className={classes.purpose}
                    label="Mobile"
                    classes={{
                        label: state.accountType === BackupAccountType.Phone ? classes.selectedLabel : classes.label,
                    }}
                    value={BackupAccountType.Phone}
                    control={
                        <Radio
                            classes={{ root: classes.control, checked: classes.checked }}
                            color="primary"
                            value={BackupAccountType.Phone}
                            icon={<Icons.RadioButtonUnChecked color={theme.palette.maskColor.line} size={18} />}
                            checkedIcon={<Icons.RadioButtonChecked size={18} />}
                        />
                    }
                />
            </RadioGroup>
            <Box mt={2}>
                {state.step === RestoreStep.InputEmail ?
                    <EmailField />
                :   <PhoneField />}
            </Box>
        </Box>
    )
})
