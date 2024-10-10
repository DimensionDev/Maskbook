import { type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { Box, Typography, useTheme, type InputProps } from '@mui/material'
import { useState, type ReactNode } from 'react'
import { useAsyncFn } from 'react-use'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { PasswordField } from '../../components/PasswordField/index.js'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import Services from '#services'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()(() => ({
    title: {
        paddingLeft: 0,
    },
}))
interface ChangePaymentPasswordDrawer extends BottomDrawerProps {
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
    passwordNotMatch: ReactNode
    passwordTooShort: ReactNode
    originalPasswordWrong: ReactNode
    setOldPassword(p: string): void
    setNewPassword(p: string): void
    setConfirmNewPassword(p: string): void
    setPasswordNotMatch(p: ReactNode): void
    setPasswordTooShort(p: ReactNode): void
    setOriginalPasswordWrong(p: ReactNode): void
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
    const { _ } = useLingui()
    const t = useMaskSharedTrans()
    const theme = useTheme()
    const { classes } = useStyles()

    const { showSnackbar } = usePopupCustomSnackbar()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordNotMatch(<Trans>The new passwords don't match</Trans>)
            return
        }
        if ([oldPassword, newPassword, confirmNewPassword].some((x) => x.length < 6)) {
            setPasswordTooShort(<Trans>Payment password must be 6 to 20 characters.</Trans>)
            return
        }
        try {
            await Services.Wallet.changePassword(oldPassword, newPassword)
            showSnackbar(<Trans>Payment password changed.</Trans>)
            rest.onClose?.()
        } catch (error) {
            setOriginalPasswordWrong((error as Error).message)
        }
    }, [oldPassword, newPassword, confirmNewPassword, t])

    const inputProps: InputProps = {
        endAdornment: null,
        disableUnderline: true,
        inputProps: {
            maxLength: 20,
        },
    }
    return (
        <BottomDrawer {...rest} classes={{ title: classes.title }}>
            <Typography
                fontWeight={700}
                textAlign="center"
                color={theme.palette.maskColor.third}
                sx={{ marginTop: '12px' }}>
                <Trans>At least 6 characters</Trans>
            </Typography>
            <Box display="flex" justifyContent="center" flexDirection="column">
                <PasswordField
                    sx={{ mt: 2 }}
                    fullWidth
                    autoFocus
                    placeholder={_(msg`Old Payment Password`)}
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
                    placeholder={_(msg`New Payment Password`)}
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
                    placeholder={_(msg`Confirm Password`)}
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
                <Trans>Confirm</Trans>
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

export function ChangePaymentPasswordModal({ ref }: SingletonModalProps<ChangePaymentPasswordOpenProps, boolean>) {
    const [props, setProps] = useState<ChangePaymentPasswordOpenProps>({
        title: '',
    })

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')

    const [passwordNotMatch, setPasswordNotMatch] = useState<ReactNode>('')
    const [passwordTooShort, setPasswordTooShort] = useState<ReactNode>('')
    const [originalPasswordWrong, setOriginalPasswordWrong] = useState<ReactNode>('')

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
}
