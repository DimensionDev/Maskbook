import { useState, type ReactNode } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { Box, TextField, Typography, useTheme } from '@mui/material'
import { useAsyncFn } from 'react-use'
import { Icons } from '@masknet/icons'
import { type SingletonModalProps, type Wallet } from '@masknet/shared-base'
import { ActionButton } from '@masknet/theme'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useContacts } from '@masknet/web3-hooks-base'
import { Trans } from '@lingui/macro'

interface WalletRenameDrawerProps extends BottomDrawerProps {
    wallet?: Wallet
}

function WalletRenameDrawer({ wallet, ...rest }: WalletRenameDrawerProps) {
    const theme = useTheme()
    const [name, setName] = useState('')
    const [error, setError] = useState<ReactNode>()
    const contacts = useContacts()

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        if (!name || !wallet) return
        const _name = name.trim()
        if (_name.length > 18 || _name.length < 3) {
            setError(<Trans>Wallet name must between 3 to 18 characters.</Trans>)
            return
        }

        const nameExists = contacts.some((x) => x.name === _name)

        if (nameExists) {
            setError(<Trans>The wallet name already exists.</Trans>)
            return
        }

        try {
            await EVMWeb3.renameWallet(wallet.address, _name, { providerType: ProviderType.MaskWallet })
            setName('')
            rest.onClose?.()
        } catch (error) {
            setError((error as Error).message)
            return
        }
    }, [name, wallet?.address, contacts])

    return (
        <BottomDrawer {...rest}>
            <Typography
                fontWeight={700}
                textAlign="center"
                color={theme.palette.maskColor.third}
                sx={{ marginTop: '12px' }}>
                <Trans>Wallet name must between 3 to 18 characters.</Trans>
            </Typography>
            <Box display="flex" justifyContent="center" mx={0.5}>
                <TextField
                    sx={{ mt: 2 }}
                    fullWidth
                    autoFocus
                    placeholder={wallet?.name}
                    error={!!error}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setError('')
                    }}
                    InputProps={{
                        endAdornment:
                            name.length ?
                                <Icons.PopupClose
                                    onClick={() => {
                                        setName('')
                                        setError('')
                                    }}
                                    size={18}
                                    color={error ? theme.palette.maskColor.danger : undefined}
                                />
                            :   null,
                        disableUnderline: true,
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
                disabled={loading || !name.length || !!error}
                onClick={handleClick}
                sx={{ marginTop: '16px' }}>
                <Trans>Confirm</Trans>
            </ActionButton>
        </BottomDrawer>
    )
}

export type WalletRenameModalOpenProps = Omit<WalletRenameDrawerProps, 'open'>

export function WalletRenameModal({ ref }: SingletonModalProps<WalletRenameModalOpenProps, boolean>) {
    const [props, setProps] = useState<WalletRenameModalOpenProps>({
        title: '',
        wallet: undefined,
    })

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return <WalletRenameDrawer open={open} {...props} onClose={() => dispatch?.close(false)} />
}
