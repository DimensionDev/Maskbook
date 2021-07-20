import ConfirmDialog from '../../../../components/ConfirmDialog'
import { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react'
import { Box, TextField, Typography, makeStyles } from '@material-ui/core'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import { sendCode, verifyCode } from '../../api'
import { phoneRegexp } from '../../regexp'
import { MaskTextField, CountdownButton } from '@masknet/theme'

const useStyles = makeStyles({
    container: {
        minHeight: '200px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '48px',
    },
    country: {
        width: '120px',
        marginRight: '10px',
    },
    phone: {
        width: '100%',
    },
})

interface SettingPhoneNumberFormProps {}
export const SettingPhoneNumberForm = forwardRef(({}: SettingPhoneNumberFormProps, ref) => {
    const t = useDashboardI18N()
    const classes = useStyles()
    const { user, updateUser } = useContext(UserContext)
    const [countryCode, setCountryCode] = useState(user.phone ? user.phone.split(' ')[0] : '')

    const [step, setStep] = useState(user.phone ? 0 : 1)
    const [phone, setPhone] = useState(user.phone ? user.phone.split(' ')[1] : '')
    const [code, setCode] = useState('')
    const [invalidPhone, setInvalidPhone] = useState(false)
    const [invalidCode, setInvalidCode] = useState(false)

    const handleCountryCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const prefix = /^\+/.test(event.target.value) ? '' : '+'
        setCountryCode(prefix + value)
    }

    const validCheck = () => {
        if (!phone) return

        const isValid = phoneRegexp.test(countryCode + phone)
        setInvalidPhone(!isValid)
    }

    const sendValidationCode = () => {
        sendCode({
            account: countryCode + phone,
            type: 'phone',
        })
    }
    useImperativeHandle(ref, () => ({
        handleConfirm(onClose: () => void) {
            return async function () {
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
        },
    }))

    return step === 1 ? (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <div className={classes.country}>
                <MaskTextField
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    variant="outlined"
                    placeholder="+86"
                />
            </div>
            <div className={classes.phone}>
                <MaskTextField
                    fullWidth
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    onBlur={validCheck}
                    type="text"
                    variant="outlined"
                    error={invalidPhone}
                    helperText={invalidPhone ? 'The phone number is incorrect.' : ''}
                />
            </div>
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
                <CountdownButton size="medium" sx={{ width: '100px', height: '40px' }} onClick={sendValidationCode}>
                    {t.settings_button_send()}
                </CountdownButton>
            </Box>
        </Box>
    )
})

interface SettingPhoneNumberDialogProps {
    open: boolean
    onClose(): void
}

export function SettingPhoneNumberDialog({ open, onClose }: SettingPhoneNumberDialogProps) {
    const t = useDashboardI18N()
    const classes = useStyles()
    const { user } = useContext(UserContext)
    const childRef = useRef<{ handleConfirm: (onClose: () => void) => () => void }>()

    const handleClose = () => {
        onClose()
    }

    return (
        <ConfirmDialog
            title={user.phone ? t.settings_dialogs_change_phone_number() : t.settings_dialogs_setting_phone_number()}
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            onConfirm={() => childRef.current?.handleConfirm(onClose)()}>
            <div className={classes.container}>
                <SettingPhoneNumberForm ref={childRef} />
            </div>
        </ConfirmDialog>
    )
}
