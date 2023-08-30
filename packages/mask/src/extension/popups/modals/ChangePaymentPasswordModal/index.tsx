import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography, useTheme, type InputProps } from '@mui/material'
import { useAsyncFn } from 'react-use'
import { type SingletonModalRefCreator } from '@masknet/shared-base'
import { ActionButton, usePopupCustomSnackbar } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { PasswordField } from '../../components/PasswordField/index.js'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'

interface ChangePaymentPasswordDrawer extends BottomDrawerProps {
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
    passwordNotMatch: string
    passwordTooShort: string
    originalPasswordWrong: string
    setOldPassword(p: string): void
    setNewPassword(p: string): void
    setConfirmNewPassword(p: string): void
    setPasswordNotMatch(p: string): void
    setPasswordTooShort(p: string): void
    setOriginalPasswordWrong(p: string): void
}

function ChangePaymentPasswordDrawer({
    oldPassword,
    newPassword,
    confirmNewPassword,
    setOldPassword,
    setNewPassword,
    setConfirmNewPassword,
    passwordNotMatch,
    passwordTooShort,
    originalPasswordWrong,
    setPasswordNotMatch,
    setPasswordTooShort,
    setOriginalPasswordWrong,
    ...rest
}: ChangePaymentPasswordDrawer) {
    const { t } = useI18N()
    const theme = useTheme()

    const { showSnackbar } = usePopupCustomSnackbar()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordNotMatch(t('popups_wallet_new_password_not_match'))
            return
        }
        if ([oldPassword, newPassword, confirmNewPassword].some((x) => x.length < 6)) {
            setPasswordTooShort(t('popups_wallet_password_length_error'))
            return
        }
        try {
            await WalletServiceRef.value.changePassword(oldPassword, newPassword)
            showSnackbar(t('popups_wallet_password_change_successful'))
            rest.onClose?.()
        } catch (error) {
            setOriginalPasswordWrong((error as Error).message)
        }
    }, [oldPassword, newPassword, confirmNewPassword, t])

    const inputProps: InputProps = {
        endAdornment: null,
        disableUnderline: true,
        autoFocus: true,
        inputProps: {
            maxLength: 20,
        },
    }
    return (
        <BottomDrawer {...rest}>
            <Typography
                fontWeight={700}
                textAlign="center"
                color={theme.palette.maskColor.third}
                sx={{ marginTop: '12px' }}>
                {t('popups_wallet_create_payment_password_tip')}
            </Typography>
            <Box display="flex" justifyContent="center" flexDirection="column">
                <PasswordField
                    sx={{ mt: 2 }}
                    fullWidth
                    autoFocus
                    placeholder={t('popups_wallet_old_payment_password')}
                    error={!!originalPasswordWrong}
                    value={oldPassword}
                    onChange={(e) => {
                        setOldPassword(e.target.value)
                        setOriginalPasswordWrong('')
                        setPasswordTooShort('')
                    }}
                    InputProps={inputProps}
                />
                <PasswordField
                    sx={{ mt: 2 }}
                    fullWidth
                    placeholder={t('popups_wallet_new_payment_password')}
                    error={false}
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value)
                        setPasswordNotMatch('')
                        setPasswordTooShort('')
                    }}
                    InputProps={inputProps}
                />
                <PasswordField
                    sx={{ mt: 2 }}
                    fullWidth
                    placeholder={t('popups_wallet_confirm_password')}
                    error={false}
                    value={confirmNewPassword}
                    onChange={(e) => {
                        setConfirmNewPassword(e.target.value)
                        setPasswordNotMatch('')
                        setPasswordTooShort('')
                    }}
                    InputProps={inputProps}
                />
            </Box>
            <Typography fontSize={14} color={theme.palette.maskColor.danger} mt={1.5} height={32}>
                {passwordTooShort || passwordNotMatch || originalPasswordWrong}
            </Typography>
            <ActionButton loading={loading} disabled={loading} onClick={handleClick} sx={{ marginTop: '16px' }}>
                {t('confirm')}
            </ActionButton>
        </BottomDrawer>
    )
}

export type ChangePaymentPasswordOpenProps = Omit<
    ChangePaymentPasswordDrawer,
    | 'open'
    | 'oldPassword'
    | 'newPassword'
    | 'confirmNewPassword'
    | 'setOldPassword'
    | 'setNewPassword'
    | 'setConfirmNewPassword'
    | 'passwordNotMatch'
    | 'passwordTooShort'
    | 'originalPasswordWrong'
    | 'setPasswordNotMatch'
    | 'setPasswordTooShort'
    | 'setOriginalPasswordWrong'
>

export const ChangePaymentPasswordModal = forwardRef<SingletonModalRefCreator<ChangePaymentPasswordOpenProps, boolean>>(
    (_, ref) => {
        const [props, setProps] = useState<ChangePaymentPasswordOpenProps>({
            title: '',
        })

        const [oldPassword, setOldPassword] = useState('')
        const [newPassword, setNewPassword] = useState('')
        const [confirmNewPassword, setConfirmNewPassword] = useState('')

        const [passwordNotMatch, setPasswordNotMatch] = useState('')
        const [passwordTooShort, setPasswordTooShort] = useState('')
        const [originalPasswordWrong, setOriginalPasswordWrong] = useState('')

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p)
            },
        })
        return (
            <ChangePaymentPasswordDrawer
                open={open}
                oldPassword={oldPassword}
                newPassword={newPassword}
                confirmNewPassword={confirmNewPassword}
                passwordNotMatch={passwordNotMatch}
                passwordTooShort={passwordTooShort}
                originalPasswordWrong={originalPasswordWrong}
                setOldPassword={setOldPassword}
                setNewPassword={setNewPassword}
                setConfirmNewPassword={setConfirmNewPassword}
                setPasswordNotMatch={setPasswordNotMatch}
                setPasswordTooShort={setPasswordTooShort}
                setOriginalPasswordWrong={setOriginalPasswordWrong}
                {...props}
                onClose={() => {
                    setOldPassword('')
                    setNewPassword('')
                    setConfirmNewPassword('')
                    setPasswordNotMatch('')
                    setPasswordTooShort('')
                    setOriginalPasswordWrong('')
                    dispatch?.close(false)
                }}
            />
        )
    },
)
