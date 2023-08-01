import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Typography, useTheme } from '@mui/material'
import { useAsyncFn } from 'react-use'
import { PopupRoutes, type SingletonModalRefCreator } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { PasswordField } from '../../components/PasswordField/index.js'
import { WalletRPC } from '../../../../plugins/WalletService/messages.js'
import { useNavigate } from 'react-router-dom'

interface ShowPrivateKeyDrawerProps extends BottomDrawerProps {
    error: string
    password: string
    setPassword(p: string): void
    setError(p: string): void
}

function ShowPrivateKeyDrawer({ password, error, setPassword, setError, ...rest }: ShowPrivateKeyDrawerProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const navigate = useNavigate()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        const isVerify = await WalletRPC.verifyPassword(password)

        if (!isVerify) {
            setError(t('create_wallet_incorrect_payment_password'))
            return
        }
        await WalletRPC.unlockWallet(password)
        navigate(PopupRoutes.ExportWalletPrivateKey, {
            state: {
                password,
            },
        })
        rest.onClose?.()
    }, [password])

    return (
        <BottomDrawer {...rest}>
            <Box display="flex" justifyContent="center" mx={0.5}>
                <PasswordField
                    sx={{ mt: 2 }}
                    fullWidth
                    placeholder={t('popups_wallet_payment_password')}
                    error={!!error}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setError('')
                    }}
                    InputProps={{
                        disableUnderline: true,
                    }}
                    show={false}
                />
            </Box>
            {error ? (
                <Typography fontSize={14} color={theme.palette.maskColor.danger} mt={1}>
                    {error}
                </Typography>
            ) : null}
            <ActionButton
                loading={loading}
                disabled={loading || !!error || !password}
                onClick={handleClick}
                sx={{ marginTop: '16px' }}>
                {t('confirm')}
            </ActionButton>
        </BottomDrawer>
    )
}

export type ShowPrivateKeyModalOpenProps = Omit<
    ShowPrivateKeyDrawerProps,
    'open' | 'password' | 'setPassword' | 'error' | 'setError'
>

export const ShowPrivateKeyModal = forwardRef<SingletonModalRefCreator<ShowPrivateKeyModalOpenProps, boolean>>(
    (_, ref) => {
        const [props, setProps] = useState<ShowPrivateKeyModalOpenProps>({
            title: '',
        })

        const [error, setError] = useState('')
        const [password, setPassword] = useState('')

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p)
            },
        })
        return (
            <ShowPrivateKeyDrawer
                error={error}
                setError={setError}
                password={password}
                setPassword={setPassword}
                open={open}
                {...props}
                onClose={() => {
                    setError('')
                    setPassword('')
                    dispatch?.close(false)
                }}
            />
        )
    },
)
