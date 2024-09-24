import { memo, useCallback, useMemo } from 'react'
import { Box, Button, Popover, Typography } from '@mui/material'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatPersonaFingerprint, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { openPopupWindow } from '@masknet/plugin-infra/dom/context'
import { useManagers } from '../../hooks/useManagers.js'
import { useAccount, useChainContext, useNetwork, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(3),
        background: theme.palette.maskColor.bottom,
        width: 320,
        filter:
            theme.palette.mode === 'light' ?
                'drop-shadow(0px 4px 30px rgba(0, 0, 0, 0.1))'
            :   'drop-shadow(0px 4px 30px rgba(255, 255, 255, 0.15))',
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 4px 30px 0px rgba(0, 0, 0, 0.1)'
            :   '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
        textAlign: 'center',
    },
    second: {
        fontSIze: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    name: {
        fontSIze: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    changeOwner: {
        height: 32,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
        padding: '8px 12px',
    },
}))

interface AccountsManagePopoverProps {
    open: boolean
    anchorEl: HTMLElement | null
    onClose: () => void
    address?: string
    owner?: string
    name?: string
}

export const AccountsManagerPopover = memo<AccountsManagePopoverProps>(
    ({ open, anchorEl, onClose, address, owner, name }) => {
        const { classes } = useStyles()
        const { personaManagers, walletManagers } = useManagers()

        const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
        const account = useAccount()
        const network = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
        const { Network } = useWeb3State()
        const connection = useWeb3Connection()
        const ownerInfo = useMemo(() => {
            const persona = personaManagers?.find((x) => isSameAddress(x.address, owner))

            if (persona)
                return {
                    name: persona.nickname,
                    publicKey: formatPersonaFingerprint(persona.identifier.rawPublicKey, 4),
                }

            const wallet = walletManagers?.find((x) => isSameAddress(x.address, owner))
            if (!wallet) return
            return {
                name: wallet.name,
                publicKey: formatEthereumAddress(wallet.address, 4),
            }
        }, [owner, personaManagers, walletManagers])

        const handleChangeOwner = useCallback(async () => {
            // switch account
            if (!isSameAddress(address, account)) {
                await connection.connect({
                    account: address,
                    chainId,
                    providerType: ProviderType.MaskWallet,
                    silent: true,
                })

                if (network) await Network?.switchNetwork(network.ID)
            }
            await openPopupWindow(PopupRoutes.ChangeOwner, { contractAccount: address })
        }, [address, connection, account, chainId, network])

        return usePortalShadowRoot((container) => (
            <Popover
                disableScrollLock
                container={container}
                open={open}
                onClose={onClose}
                anchorEl={anchorEl}
                disableRestoreFocus
                classes={{ paper: classes.paper }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                <Typography className={classes.title}>
                    <Trans>Manage Account</Trans>
                </Typography>
                <Box mt={1.5}>
                    <Typography className={classes.name}>{name}</Typography>
                    <Typography className={classes.second}>{formatEthereumAddress(address ?? '', 4)}</Typography>
                </Box>
                <Typography className={classes.second} my={1.5}>
                    <Trans>Current Management account</Trans>
                </Typography>
                <Box component="div" display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography className={classes.name}>{ownerInfo?.name}</Typography>
                        <Typography className={classes.second}>{ownerInfo?.publicKey}</Typography>
                    </Box>
                    <Button className={classes.changeOwner} variant="roundedContained" onClick={handleChangeOwner}>
                        <Trans>Change Owner</Trans>
                    </Button>
                </Box>
            </Popover>
        ))
    },
)
