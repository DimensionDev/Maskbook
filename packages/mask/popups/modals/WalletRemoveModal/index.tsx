import { PopupRoutes, type SingletonModalProps, type Wallet } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { ActionButton } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box, Typography, useTheme } from '@mui/material'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import Services from '#services'
import { PasswordField } from '../../components/PasswordField/index.js'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface WalletRemoveDrawerProps extends BottomDrawerProps {
    error: ReactNode
    password: string
    setPassword: (p: string) => void
    setError: (e: ReactNode) => void
    wallet?: Wallet
}

function WalletRemoveDrawer({ wallet, error, password, setPassword, setError, ...rest }: WalletRemoveDrawerProps) {
    const { _ } = useLingui()
    const theme = useTheme()
    const navigate = useNavigate()
    const wallets = useWallets()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!password || !wallet) return

        try {
            const verified = await Services.Wallet.verifyPassword(password)

            if (!verified) {
                setError(<Trans>Incorrect Payment Password.</Trans>)
                return
            }
            const index = wallets.findIndex((x) => isSameAddress(x.address, wallet.address))
            const remainWallets = wallets.filter(
                (x) => !isSameAddress(x.address, wallet.address) && !isSameAddress(x.owner, wallet.address),
            )
            let nextWallet = wallets[index + 1] || wallets[0]
            if (!remainWallets.includes(nextWallet)) nextWallet = remainWallets[0]

            await EVMWeb3.removeWallet?.(wallet.address, password, { providerType: ProviderType.MaskWallet })

            await EVMWeb3.connect({
                providerType: ProviderType.MaskWallet,
                account: nextWallet?.address ?? '',
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
                <Trans>Are you sure to remove this wallet?</Trans>
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
                    placeholder={_(msg`Payment Password`)}
                    error={!!error}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setError('')
                    }}
                />
            </Box>
            {error ?
                <Typography fontSize={14} color={theme.palette.maskColor.danger} mt={1}>
                    {error}
                </Typography>
            :   null}
            <ActionButton
                loading={loading}
                disabled={loading || !password.length || !!error}
                onClick={handleClick}
                color="error"
                sx={{ marginTop: '16px' }}>
                <Trans>Remove</Trans>
            </ActionButton>
        </BottomDrawer>
    )
}

export type WalletRemoveModalOpenProps = Omit<
    WalletRemoveDrawerProps,
    'open' | 'password' | 'setPassword' | 'error' | 'setError'
>

export function WalletRemoveModal({ ref }: SingletonModalProps<WalletRemoveModalOpenProps, boolean>) {
    const [props, setProps] = useState<WalletRemoveModalOpenProps>({
        title: '',
        wallet: undefined,
    })

    const [password, setPassword] = useState('')
    const [error, setError] = useState<ReactNode>('')

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
}
