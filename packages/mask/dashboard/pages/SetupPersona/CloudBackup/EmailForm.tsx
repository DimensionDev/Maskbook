import { memo, useCallback } from 'react'
import { CountdownButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Controller } from 'react-hook-form'
import { Box, TextField } from '@mui/material'
import { sendCode } from '../../../utils/api.js'
import { BackupAccountType } from '@masknet/shared-base'
import { Locale, Scenario } from '../../../utils/type.js'
import { UserContext, useLanguage } from '../../../../shared-ui/index.js'
import { CloudBackupFormContext } from '../../../contexts/CloudBackupFormContext.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    send: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
}))

export const EmailForm = memo(function EmailForm() {
    const { _ } = useLingui()
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
            type: BackupAccountType.Email,
            scenario: user.email ? Scenario.change : Scenario.create,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        }).catch((error) => {
            showSnackbar(
                error.message.includes('SendTemplatedEmail') ?
                    <Trans>Invalid email address format.</Trans>
                :   error.message,
                { variant: 'error' },
            )
        })

        if (response) {
            showSnackbar(<Trans>Verification code sent</Trans>, { variant: 'success' })
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
                        placeholder={_(msg`Email`)}
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
                        placeholder={_(msg`Email verification code`)}
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
