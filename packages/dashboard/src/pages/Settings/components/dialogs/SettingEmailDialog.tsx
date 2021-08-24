import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useContext, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import { sendCode, verifyCode } from '../../api'
import { emailRegexp } from '../../regexp'
import { CountdownButton, MaskTextField, useSnackbar } from '@masknet/theme'

const useStyles = makeStyles()({
    container: {
        minHeight: 180,
        paddingLeft: 20,
        paddingRight: 20,
    },
})

interface SettingEmailDialogProps {
    open: boolean
    onClose(): void
}

export default function SettingEmailDialog({ open, onClose }: SettingEmailDialogProps) {
    const snackbar = useSnackbar()
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { user, updateUser } = useContext(UserContext)
    const [step, setStep] = useState(user.email ? 0 : 1)
    const [email, setEmail] = useState(user.email ?? '')
    const [code, setCode] = useState('')
    const [invalidEmail, setInvalidEmail] = useState(false)
    const [invalidCode, setInvalidCode] = useState(false)

    const handleClose = () => {
        onClose()
    }
    const handleConfirm = async () => {
        if (step === 1) {
            if (!invalidEmail) {
                setStep(2)
            }
        } else {
            const result = await verifyCode({
                account: email,
                type: 'email',
                code,
            }).catch((err) => {
                if (err.status === 400) {
                    // incorrect code
                    setInvalidCode(true)
                }
            })

            if (result) {
                if (step === 0) {
                    // original email verified
                    setEmail('')
                    setCode('')
                    setStep(1)
                } else {
                    const msg = user.email ? t.settings_alert_email_updated() : t.settings_alert_email_set()
                    snackbar.enqueueSnackbar(msg, { variant: 'success' })

                    updateUser({ email })
                    onClose()
                }
            }
        }
    }

    const validCheck = () => {
        if (!email) return

        const isValid = emailRegexp.test(email)
        setInvalidEmail(!isValid)
    }

    const sendValidationEmail = async () => {
        const res = await sendCode({
            account: email,
            type: 'email',
        }).catch((error) => {
            snackbar.enqueueSnackbar(error.message, { variant: 'error' })
        })

        if (res) {
            snackbar.enqueueSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
        }
    }

    return (
        <ConfirmDialog
            title={user.email ? t.settings_dialogs_change_email() : t.settings_dialogs_setting_email()}
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            onConfirm={handleConfirm}
            confirmText={step === 1 ? t.next() : t.confirm()}>
            {step === 1 ? (
                <Box className={classes.container} sx={{ display: 'flex', alignItems: 'center' }}>
                    <MaskTextField
                        fullWidth
                        sx={{ flex: 1 }}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onBlur={validCheck}
                        type="email"
                        placeholder="Input your email"
                        error={invalidEmail}
                        helperText={invalidEmail ? 'The email address is incorrect.' : ''}
                    />
                </Box>
            ) : (
                <Box className={classes.container} sx={{ paddingTop: '24px' }}>
                    <Typography>{t.settings_dialogs_current_email_validation()}</Typography>
                    <Typography color="primary" fontWeight="bold" variant="h4">
                        {email}
                    </Typography>
                    <Box sx={{ display: 'flex', paddingTop: '10px', alignItems: 'flex-start' }}>
                        <MaskTextField
                            size="small"
                            sx={{ flex: 1, marginRight: '10px' }}
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            error={invalidCode}
                            helperText={invalidCode ? t.settings_dialogs_incorrect_code() : ''}
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
