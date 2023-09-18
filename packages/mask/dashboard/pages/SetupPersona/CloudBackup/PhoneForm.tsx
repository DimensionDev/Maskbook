import { memo, useCallback, useMemo, useState } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { UserContext, useLanguage } from '../../../../shared-ui/index.js'
import { CloudBackupFormContext } from '../../../contexts/CloudBackupFormContext.js'
import { Box, TextField, Typography } from '@mui/material'
import { Controller } from 'react-hook-form'
import { Icons } from '@masknet/icons'
import { CountryCodePicker } from '../../../components/CountryCodePicker/index.js'
import REGIONS from '../../../assets/region.json'
import { CountdownButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { AccountType, Scenario, Locale } from '../../../type.js'
import { sendCode } from '../../../utils/api.js'
import { COUNTRY_ICON_URL } from '../../../constants.js'

const useStyles = makeStyles()((theme) => ({
    send: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
}))

export const PhoneForm = memo(function PhoneForm() {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { user } = UserContext.useContainer()
    const lang = useLanguage()
    const { showSnackbar } = useCustomSnackbar()

    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

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

    const countryIcon = useMemo(() => {
        if (!countryCode) return
        const target = REGIONS.find((x) => x.dial_code === countryCode)
        if (!target) return
        return `${COUNTRY_ICON_URL}${target.code.toLowerCase()}.svg`
    }, [countryCode])

    const handleSendVerificationCode = useCallback(async () => {
        const response = await sendCode({
            account: phone,
            type: AccountType.Phone,
            scenario: user.phone ? Scenario.change : Scenario.create,
            locale: lang.includes('zh') ? Locale.zh : Locale.en,
        }).catch((error) => {
            showSnackbar(error.message, { variant: 'error' })
        })

        if (response) {
            showSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
        }
    }, [phone, user, lang])

    return (
        <Box component="form" width="100%" display="flex" flexDirection="column" rowGap={2}>
            <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                    <TextField
                        {...field}
                        onFocus={() => clearErrors('phone')}
                        fullWidth
                        placeholder={t.mobile_number()}
                        type="tel"
                        error={!!errors.phone?.message}
                        helperText={errors.phone?.message}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: (
                                <Typography
                                    display="flex"
                                    alignItems="center"
                                    columnGap="4px"
                                    style={{ cursor: 'pointer' }}
                                    onClick={(event) => {
                                        setAnchorEl(event.currentTarget)
                                        setOpen(true)
                                    }}>
                                    <img src={countryIcon} style={{ width: 16, height: 12 }} />
                                    <Box
                                        component="span"
                                        sx={{ minWidth: 32, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {countryCode}
                                    </Box>
                                    <Icons.ArrowDrop size={16} />
                                </Typography>
                            ),
                        }}
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
                                    disabled={!phone && !!errors.phone?.message}
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
            <CountryCodePicker
                open={open}
                code={countryCode}
                anchorEl={anchorEl}
                onClose={(code) => {
                    if (code) setValue('countryCode', code)
                    setOpen(false)
                }}
            />
        </Box>
    )
})
