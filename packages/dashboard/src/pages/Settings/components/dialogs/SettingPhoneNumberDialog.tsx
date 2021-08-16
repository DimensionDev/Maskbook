import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useContext, useState } from 'react'
import { Box, TextField, Typography, makeStyles } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import CountdownButton from '../../../../components/CountdownButton'
import { sendCode, verifyCode } from '../../api'
import { phoneRegexp } from '../../regexp'

const useStyles = makeStyles({
    container: {
        minHeight: '200px',
        paddingLeft: '20px',
        paddingRight: '20px',
    },
})

interface SettingPhoneNumberDialogProps {
    open: boolean
    onClose(): void
}

export default function SettingPhoneNumberDialog({ open, onClose }: SettingPhoneNumberDialogProps) {
    const t = useDashboardI18N()
    const classes = useStyles()
    const { user, updateUser } = useContext(UserContext)
    const [step, setStep] = useState(user.phone ? 0 : 1)
    const [countryCode, setCountryCode] = useState(user.phone ? user.phone.split(' ')[0] : '')
    const [phone, setPhone] = useState(user.phone ? user.phone.split(' ')[1] : '')
    const [code, setCode] = useState('')
    const [invalidPhone, setInvalidPhone] = useState(false)
    const [invalidCode, setInvalidCode] = useState(false)

    const handleCountryCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const prefix = /^\+/.test(event.target.value) ? '' : '+'
        setCountryCode(prefix + value)
    }

    const handleClose = () => {
        onClose()
    }
    const handleConfirm = async () => {
        if (step === 1) {
            if (!invalidPhone) {
                setStep(2)
            }
        } else {
            const result = await verifyCode({
                account: countryCode + phone,
                type: 'phone',
                code,
            })

            if (result.message) {
                setInvalidCode(true)
            } else {
                if (step === 0) {
                    // original email verified
                    setCountryCode('')
                    setPhone('')
                    setCode('')
                    setStep(1)
                } else {
                    updateUser({ phone: `${countryCode} ${phone}` })
                    onClose()
                }
            }
        }
    }

    const validCheck = () => {
        if (!phone) return

        const isValid = phoneRegexp.test(phone)
        setInvalidPhone(!isValid)
    }

    const sendValidationEmail = () => {
        sendCode({
            account: countryCode + phone,
            type: 'phone',
        })
    }

    return (
        <ConfirmDialog
            title={user.phone ? t.settings_dialogs_change_phone_number() : t.settings_dialogs_setting_phone_number()}
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            {step === 1 ? (
                <Box
                    className={classes.container}
                    sx={{ display: 'flex', alignItems: 'flex-start', paddingTop: '48px' }}>
                    <TextField
                        value={countryCode}
                        onChange={handleCountryCodeChange}
                        variant="outlined"
                        placeholder="+86"
                        sx={{ marginRight: '10px', width: '120px' }}
                    />
                    <TextField
                        fullWidth
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        onBlur={validCheck}
                        type="text"
                        variant="outlined"
                        error={invalidPhone}
                        helperText={invalidPhone ? 'The phone number is incorrect.' : ''}
                    />
                </Box>
            ) : (
                <Box className={classes.container} sx={{ paddingTop: '24px' }}>
                    <Typography>{t.settings_dialogs_current_phone_validation()}</Typography>
                    <Typography color="primary" fontWeight="bold" variant="h4">
                        {countryCode} {phone}
                    </Typography>
                    <Box sx={{ display: 'flex', paddingTop: '10px', alignItems: 'flex-start' }}>
                        <TextField
                            size="small"
                            sx={{ flex: 1, marginRight: '10px' }}
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            error={invalidCode}
                            helperText={invalidCode ? t.settings_dialogs_incorrect_phone() : ''}
                        />
                        <CountdownButton
                            size="medium"
                            sx={{ width: '100px', height: '40px' }}
                            onClick={sendValidationEmail}>
                            {t.settings_button_send()}
                        </CountdownButton>
                    </Box>
                </Box>
            )}
        </ConfirmDialog>
    )
}
