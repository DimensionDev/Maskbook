import { PopupRoutes, type SingletonModalRefCreator, type Wallet } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { ActionButton } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box, Typography, useTheme } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import Services from '#services'
import { PasswordField } from '../../components/PasswordField/index.js'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'

interface WalletRemoveDrawerProps extends BottomDrawerProps {
    error: string
    password: string
    setPassword: (p: string) => void
    setError: (e: string) => void
    wallet?: Wallet
}

function WalletRemoveDrawer({ wallet, error, password, setPassword, setError, ...rest }: WalletRemoveDrawerProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const navigate = useNavigate()
    const wallets = useWallets()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!password || !wallet) return

        try {
            const verified = await Services.Wallet.verifyPassword(password)

            if (!verified) {
                setError(t('create_wallet_incorrect_payment_password'))
                return
            }
            await Web3.removeWallet?.(wallet.address, password, { providerType: ProviderType.MaskWallet })
            const index = wallets.findIndex((x) => isSameAddress(x.address, wallet.address))
            const nextWallet = wallets[index + 1] || wallets[0]
            await Web3.connect({
                providerType: ProviderType.MaskWallet,
                account: nextWallet.address,
            })
            rest.onClose?.()

            navigate(PopupRoutes.Wallet, { replace: true })
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
                    autoFocus
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
        <WalletRemoveDrawer
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
