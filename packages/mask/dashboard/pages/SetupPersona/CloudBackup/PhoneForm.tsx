import { memo, useCallback } from 'react'
import { Controller } from 'react-hook-form'
import { Box, TextField } from '@mui/material'
import { PhoneNumberField } from '@masknet/shared'
import { CountdownButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { UserContext, useLanguage } from '../../../../shared-ui/index.js'
import { CloudBackupFormContext } from '../../../contexts/CloudBackupFormContext.js'
import { BackupAccountType } from '@masknet/shared-base'
import { Scenario, Locale } from '../../../utils/type.js'
import { sendCode } from '../../../utils/api.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    send: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
}))

export const PhoneForm = memo(function PhoneForm() {
    const { _ } = useLingui()
    const { classes } = useStyles()
    const { user } = UserContext.useContainer()
    const lang = useLanguage()
    const { showSnackbar } = useCustomSnackbar()

    const {
        formState: {
            control,
            clearErrors,
            watch,
            setValue,
            formState: { errors },
        },
    } = CloudBackupFormContext.useContainer()

    const [countryCode, phone] = watch(['countryCode', 'phone'])

    const handleSendVerificationCode = useCallback(async () => {
        const response = await sendCode({
            account: `+${countryCode}${phone}`,
            type: BackupAccountType.Phone,
            scenario: user.phone ? Scenario.change : Scenario.create,
            locale: lang.includes('zh') ? Locale.zh : Locale.en,
        }).catch((error) => {
            showSnackbar(error.message, { variant: 'error' })
        })

        if (response) {
            showSnackbar(<Trans>Verification code sent</Trans>, { variant: 'success' })
        }
    }, [phone, user, lang, countryCode])

    return (
        <Box component="form" width="100%" display="flex" flexDirection="column" rowGap={2}>
            <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                    <PhoneNumberField
                        {...field}
                        code={countryCode}
                        onCodeChange={(code) => setValue('countryCode', code)}
                        onFocus={() => clearErrors('phone')}
                        fullWidth
                        placeholder={_(msg`Mobile number`)}
                        error={!!errors.phone?.message}
                        helperText={errors.phone?.message}
                    />
                )}
            />
            <Controller
                control={control}
                name="code"
                render={({ field }) => (
                    <TextField
                        {...field}
                        onFocus={() => clearErrors('code')}
                        fullWidth
                        placeholder={_(msg`Phone verification code`)}
                        error={!!errors.code?.message}
                        helperText={errors.code?.message}
                        InputProps={{
                            disableUnderline: true,
                            endAdornment: (
                                <CountdownButton
                                    disableElevation
                                    disableTouchRipple
                                    className={classes.send}
                                    disableFocusRipple
                                    disableRipple
                                    disabled={!phone || !!errors.phone?.message}
                                    variant="text"
                                    sx={{ px: 0 }}
                                    onClick={handleSendVerificationCode}
                                    repeatContent={<Trans>Resend</Trans>}>
                                    <Trans>Send</Trans>
                                </CountdownButton>
                            ),
                        }}
                    />
                )}
            />
        </Box>
    )
})
