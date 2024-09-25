import { useState, type ReactNode } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { Box, Typography, useTheme } from '@mui/material'
import { useAsyncFn } from 'react-use'
import { PopupRoutes, type SingletonModalProps } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { PasswordField } from '../../components/PasswordField/index.js'
import Services from '#services'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@masknet/web3-hooks-base'
import { noop } from 'lodash-es'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface ShowPrivateKeyDrawerProps extends BottomDrawerProps {
    error: ReactNode
    password: string
    setPassword(p: string): void
    setError(p: ReactNode): void
}

function ShowPrivateKeyDrawer({ password, error, setPassword, setError, ...rest }: ShowPrivateKeyDrawerProps) {
    const { _ } = useLingui()
    const theme = useTheme()
    const wallet = useWallet()
    const navigate = useNavigate()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        const verified = await Services.Wallet.verifyPassword(password)

        if (!verified) {
            setError(<Trans>Incorrect Payment Password.</Trans>)
            return
        }
        if (!wallet) return
        await Services.Wallet.unlockWallet(password)
        navigate(PopupRoutes.ExportWalletPrivateKey, {
            state: {
                password,
                hasMnemonic:
                    wallet.mnemonicId ?? !!(await Services.Wallet.exportMnemonicWords(wallet.address).catch(noop)),
            },
        })
        rest.onClose?.()
    }, [password, wallet])

    return (
        <BottomDrawer {...rest}>
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
                disabled={loading || !!error || !password}
                onClick={handleClick}
                sx={{ marginTop: '16px' }}>
                <Trans>Confirm</Trans>
            </ActionButton>
        </BottomDrawer>
    )
}

export type ShowPrivateKeyModalOpenProps = Omit<
    ShowPrivateKeyDrawerProps,
    'open' | 'password' | 'setPassword' | 'error' | 'setError'
>

export function ShowPrivateKeyModal({ ref }: SingletonModalProps<ShowPrivateKeyModalOpenProps, boolean>) {
    const [props, setProps] = useState<ShowPrivateKeyModalOpenProps>({
        title: '',
    })

    const [error, setError] = useState<ReactNode>('')
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
}
