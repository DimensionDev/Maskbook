import { forwardRef, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, useTheme } from '@mui/material'
import { ActionButton } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { Web3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { PopupRoutes, type SingletonModalRefCreator, type Wallet } from '@masknet/shared-base'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { PasswordField } from '../../components/PasswordField/index.js'
import Services from '../../../service.js'

interface WalletRemoveDrawerProps extends BottomDrawerProps {
    error: string
    password: string
    setPassword: (p: string) => void
    setError: (e: string) => void
    wallet?: Wallet
}

function WalletRenameDrawer({ wallet, error, password, setPassword, setError, ...rest }: WalletRemoveDrawerProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const navigate = useNavigate()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!password || !wallet) return

        try {
            const verified = await Services.Wallet.verifyPassword(password)

            if (!verified) {
                setError(t('create_wallet_incorrect_payment_password'))
                return
            }
            await Web3.removeWallet?.(wallet.address, password, { providerType: ProviderType.MaskWallet })
            rest.onClose?.()

            const wallets = await Services.Wallet.getWallets()

            if (!wallets.length) {
                navigate(PopupRoutes.WalletStartUp, { replace: true })
            } else {
                navigate(PopupRoutes.Wallet, { replace: true })
            }
        } catch (error) {
            setError((error as Error).message)
            return
        }
    }, [password, wallet?.address])

    return (
        <BottomDrawer {...rest}>
            <Typography
                fontWeight={700}
                textAlign="center"
                color={theme.palette.maskColor.third}
                sx={{ marginTop: '12px' }}>
                {t('popups_wallet_settings_are_you_sure_remove_wallet')}
            </Typography>
            <Typography
                fontWeight={700}
                textAlign="center"
                color={theme.palette.maskColor.main}
                sx={{ marginTop: '0px' }}>
                {wallet?.address}
            </Typography>
            <Box display="flex" justifyContent="center" mx={0.5}>
                <PasswordField
                    sx={{ mt: 2 }}
                    fullWidth
                    show={false}
                    placeholder={t('popups_wallet_payment_password')}
                    error={!!error}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setError('')
                    }}
                />
            </Box>
            {error ? (
                <Typography fontSize={14} color={theme.palette.maskColor.danger} mt={1}>
                    {error}
                </Typography>
            ) : null}
            <ActionButton
                loading={loading}
                disabled={loading || !password.length || !!error}
                onClick={handleClick}
                color="error"
                sx={{ marginTop: '16px' }}>
                {t('remove')}
            </ActionButton>
        </BottomDrawer>
    )
}

export type WalletRemoveModalOpenProps = Omit<
    WalletRemoveDrawerProps,
    'open' | 'password' | 'setPassword' | 'error' | 'setError'
>

export const WalletRemoveModal = forwardRef<SingletonModalRefCreator<WalletRemoveModalOpenProps, boolean>>((_, ref) => {
    const [props, setProps] = useState<WalletRemoveModalOpenProps>({
        title: '',
        wallet: undefined,
    })

    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <WalletRenameDrawer
            password={password}
            setPassword={setPassword}
            error={error}
            setError={setError}
            open={open}
            {...props}
            onClose={() => {
                setError('')
                setPassword('')
                dispatch?.close(false)
            }}
        />
    )
})
