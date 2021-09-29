import ConfirmDialog from '../../../../components/ConfirmDialog'
import { useContext, useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { UserContext } from '../../hooks/UserContext'
import { useDashboardI18N } from '../../../../locales'
import { phoneRegexp } from '../../regexp'
import { CountdownButton, MaskTextField, useSnackbar } from '@masknet/theme'
import { Scenario, Locale, AccountType } from '../../type'
import {
    fetchBackupValue,
    fetchDownloadLink,
    fetchUploadLink,
    sendCode,
    uploadBackupValue,
    useLanguage,
    verifyCode,
    VerifyCodeRequest,
} from '../../api'
import { decryptBackup, encryptBackup } from '@masknet/backup-format'
import { encode } from '@msgpack/msgpack'

const useStyles = makeStyles()({
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
    const language = useLanguage()
    const snackbar = useSnackbar()
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { user, updateUser } = useContext(UserContext)
    const [step, setStep] = useState(user.phone ? 0 : 1)
    const [countryCode, setCountryCode] = useState(user.phone ? user.phone.split(' ')[0] : '+1')
    const [phone, setPhone] = useState(user.phone ? user.phone.split(' ')[1] : '')
    const [code, setCode] = useState('')
    const [invalidPhone, setInvalidPhone] = useState(false)
    const [invalidCode, setInvalidCode] = useState(false)

    // cloud backup
    const [backupInfo, setBackupInfo] = useState({
        url: '',
        abstract: '',
    })

    const sendButton = useRef<HTMLButtonElement>(null)

    const handleCountryCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        const prefix = value.startsWith('+') ? '' : '+'
        setCountryCode(prefix + value)
    }

    const handleClose = () => {
        onClose()
    }
    const handleConfirm = async () => {
        if (step === 1) {
            if (phone && !invalidPhone) {
                setStep(2)
            } else {
                validCheck()
            }
        } else {
            const params = {
                account: countryCode + phone,
                type: AccountType.phone,
                code,
            }

            if (step === 0) {
                return checkCloudBackup(params)
            } else if (backupInfo.abstract) {
                return uploadCloudBackup(params)
            }

            const result = await verifyCode(params).catch((err) => {
                if (err.status === 400) {
                    // incorrect code
                    setInvalidCode(true)
                }
            })

            if (result) {
                onSuccess()
            }
        }
    }

    const originalPhoneVerified = () => {
        setCountryCode('+1')
        setPhone('')
        setCode('')
        setStep(1)
    }

    const onSuccess = () => {
        const msg = user.phone ? t.settings_alert_phone_number_updated() : t.settings_alert_phone_number_set()
        snackbar.enqueueSnackbar(msg, { variant: 'success' })

        updateUser({ phone: `${countryCode} ${phone}` })
        onClose()
    }

    const checkCloudBackup = async (params: VerifyCodeRequest) => {
        const res = await fetchDownloadLink(params).catch((error) => {
            if (error.status === 400) {
                setInvalidCode(true)
            } else if (error.status === 404) {
                // no cloud backup file
                originalPhoneVerified()
            }
        })

        if (res) {
            originalPhoneVerified()
            setBackupInfo({
                url: res.downloadURL,
                abstract: res.abstract,
            })
        }
    }

    const uploadCloudBackup = async (params: VerifyCodeRequest) => {
        if (!user.phone || !user.backupPassword) return

        const encrypted = await fetchBackupValue(backupInfo.url)
        const decrypted = await decryptBackup(encode(user.phone.replace(' ', '') + user.backupPassword), encrypted)
        const data = await encryptBackup(encode(countryCode + phone + user.backupPassword), decrypted)
        const uploadUrl = await fetchUploadLink({ ...params, abstract: backupInfo.abstract }).catch((error) => {
            if (error.status === 400) {
                setInvalidCode(true)
            }
        })

        if (uploadUrl) {
            await uploadBackupValue(uploadUrl, data)
            onSuccess()
        }
    }

    const validCheck = () => {
        if (!phone) return setInvalidPhone(true)

        const isValid = phoneRegexp.test(countryCode + phone)
        setInvalidPhone(!isValid)
    }

    const sendValidationCode = () => {
        sendCode({
            account: countryCode + phone,
            type: AccountType.phone,
            scenario: user.email ? Scenario.change : Scenario.create,
            locale: language.includes('zh') ? Locale.zh : Locale.en,
        })
            .then(() => {
                snackbar.enqueueSnackbar(t.settings_alert_validation_code_sent(), { variant: 'success' })
            })
            .catch((error) => {
                snackbar.enqueueSnackbar(error.message, { variant: 'error' })
            })
    }

    useEffect(() => {
        if (step === 2) sendButton.current?.click()
    }, [step])

    return (
        <ConfirmDialog
            title={user.phone ? t.settings_dialogs_change_phone_number() : t.settings_dialogs_setting_phone_number()}
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            onConfirm={handleConfirm}
            confirmText={step === 1 ? t.next() : t.confirm()}>
            {step === 1 ? (
                <Box
                    className={classes.container}
                    sx={{ display: 'flex', alignItems: 'flex-start', paddingTop: '48px' }}>
                    <MaskTextField
                        value={countryCode}
                        onChange={handleCountryCodeChange}
                        placeholder="+86"
                        sx={{ marginRight: '10px', width: '60px' }}
                    />
                    <MaskTextField
                        fullWidth
                        sx={{ flex: 1 }}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        onBlur={validCheck}
                        type="text"
                        error={invalidPhone}
                        helperText={invalidPhone ? t.settings_dialogs_incorrect_phone() : ''}
                    />
                </Box>
            ) : (
                <Box className={classes.container} sx={{ paddingTop: '24px' }}>
                    <Typography sx={{ paddingBottom: '8px' }}>
                        {step === 0
                            ? t.settings_dialogs_change_phone_validation()
                            : t.settings_dialogs_current_phone_validation()}
                    </Typography>
                    <Typography color="primary" fontWeight="bold" variant="h4">
                        {countryCode} {phone}
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
                            ref={sendButton}
                            size="medium"
                            sx={{ width: '100px', height: '40px' }}
                            repeatContent={t.resend()}
                            onClick={sendValidationCode}>
                            {t.send()}
                        </CountdownButton>
                    </Box>
                </Box>
            )}
        </ConfirmDialog>
    )
}
