import { memo, useCallback } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { CountdownButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Controller } from 'react-hook-form'
import { Box, TextField } from '@mui/material'
import { sendCode } from '../../../utils/api.js'
import { AccountType, Locale, Scenario } from '../../../type.js'
import { UserContext, useLanguage } from '../../../../shared-ui/index.js'
import { CloudBackupFormContext } from '../../../contexts/CloudBackupFormContext.js'

const useStyles = makeStyles()((theme) => ({
    send: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
}))

export const EmailForm = memo(function EmailForm() {
    const t = useDashboardI18N()
    const language = useLanguage()
    const { classes } = useStyles()
    const { user } = UserContext.useContainer()
    const { showSnackbar } = useCustomSnackbar()
    const {
        formState: {
            clearErrors,
            control,
            watch,
            trigger,
            formState: { errors },
        },
    } = CloudBackupFormContext.useContainer()

    const email = watch('email')

    const handleSendVerificationCode = useCallback(async () => {
        const response = await sendCode({
            account: email,
            type: AccountType.Email,
            scenario: user.email ? Scenario.change : Scenario.create,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        }).catch((error) => {
            showSnackbar(error.message, { variant: 'error' })
        })

        if (response) {
            showSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
        }
    }, [email, user, language])

    return (
        <Box component="form" width="100%" display="flex" flexDirection="column" rowGap={2}>
            <Controller
                control={control}
                name="email"
                render={({ field }) => (
                    <TextField
                        {...field}
                        onFocus={() => clearErrors('email')}
                        onBlur={() => trigger('email')}
                        fullWidth
                        placeholder={t.email()}
                        type="email"
                        error={!!errors.email?.message}
                        helperText={errors.email?.message}
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
                        placeholder={t.cloud_backup_email_verification_code()}
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
                                    disabled={!email || !!errors.email?.message}
                                    variant="text"
                                    sx={{ width: 120 }}
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
