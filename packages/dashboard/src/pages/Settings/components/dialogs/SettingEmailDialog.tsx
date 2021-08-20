import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useContext, useState } from 'react'
import { Box, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import { sendCode, verifyCode } from '../../api'
import { emailRegexp } from '../../regexp'
import { CountdownButton } from '@masknet/theme'

const useStyles = makeStyles()({
    container: {
        minHeight: '200px',
        paddingLeft: '20px',
        paddingRight: '20px',
    },
})

interface SettingEmailDialogProps {
    open: boolean
    onClose(): void
}

export default function SettingEmailDialog({ open, onClose }: SettingEmailDialogProps) {
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
            })

            if (result.message) {
                // incorrect code
                setInvalidCode(true)
            } else {
                if (step === 0) {
                    // original email verified
                    setEmail('')
                    setCode('')
                    setStep(1)
                } else {
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

    const sendValidationEmail = () => {
        sendCode({
            account: email,
            type: 'email',
        })
    }

    return (
        <ConfirmDialog
            title={user.email ? t.settings_dialogs_change_email() : t.settings_dialogs_setting_email()}
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            {step === 1 ? (
                <Box className={classes.container} sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onBlur={validCheck}
                        type="email"
                        label="Input your email"
                        variant="outlined"
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
                        <TextField
                            size="small"
                            sx={{ flex: 1, marginRight: '10px' }}
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            error={invalidCode}
                            helperText={invalidCode ? t.settings_dialogs_incorrect_email() : ''}
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
