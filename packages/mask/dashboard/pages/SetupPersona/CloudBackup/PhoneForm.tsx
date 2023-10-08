import { memo, useCallback } from 'react'
import { Controller } from 'react-hook-form'
import { Box, TextField } from '@mui/material'
import { PhoneNumberField } from '@masknet/shared'
import { CountdownButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'
import { UserContext, useLanguage } from '../../../../shared-ui/index.js'
import { CloudBackupFormContext } from '../../../contexts/CloudBackupFormContext.js'
import { AccountType, Scenario, Locale } from '../../../type.js'
import { sendCode } from '../../../utils/api.js'

const useStyles = makeStyles()((theme) => ({
    send: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
}))

export const PhoneForm = memo(function PhoneForm() {
    const t = useDashboardTrans()
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
            type: AccountType.Phone,
            scenario: user.phone ? Scenario.change : Scenario.create,
            locale: lang.includes('zh') ? Locale.zh : Locale.en,
        }).catch((error) => {
            showSnackbar(error.message, { variant: 'error' })
        })

        if (response) {
            showSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
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
                        placeholder={t.mobile_number()}
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
                        placeholder={t.cloud_backup_phone_verification_code()}
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
                                    repeatContent={t.resend()}>
                                    {t.send()}
                                </CountdownButton>
                            ),
                        }}
                    />
                )}
            />
        </Box>
    )
})
