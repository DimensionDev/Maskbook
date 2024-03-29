import { Icons } from '@masknet/icons'
import { CopyButton, WalletIcon } from '@masknet/shared'
import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import {
    useChainContext,
    useProviderDescriptor,
    useNetworkDescriptor,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import { Box, IconButton, Link, Popover, Typography, alpha } from '@mui/material'
import { memo, useCallback } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        backgroundColor: alpha(theme.palette.maskColor.white, 0.2),
    },
    popover: {
        padding: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: alpha(theme.palette.maskColor.white, 0.2),
    },
    walletName: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        marginTop: theme.spacing(1),
    },
    button: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },

    iconButton: {
        background: theme.palette.maskColor.secondaryBottom,
        borderRadius: 99,
        padding: theme.spacing(1.5),
    },
    disconnectButton: {
        background: alpha(theme.palette.maskColor.danger, 0.1),
        color: theme.palette.maskColor.danger,
    },
    text: {
        fontSize: 10,
        color: theme.palette.maskColor.second,
    },
}))

interface AccountManagerProps {
    open: boolean
    anchorEl?: HTMLElement | null
    onClose: () => void
    walletName?: string
}

export const AccountManager = memo<AccountManagerProps>(function AccountManager({
    open,
    anchorEl,
    onClose,
    walletName,
}) {
    const { classes, cx } = useStyles()
    const { pluginID } = useNetworkContext()
    const { account, chainId, providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const providerDescriptor = useProviderDescriptor(pluginID)
    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)

    const handleDisconnect = useCallback(async () => {
        try {
            await EVMWeb3.disconnect({
                providerType,
            })
            onClose()
        } catch {
            console.error('Failed to disconnect')
        }
    }, [providerType])
    return (
        <Popover
            classes={{ paper: classes.root }}
            disableScrollLock
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Box className={classes.popover}>
                <WalletIcon
                    size={50}
                    badgeSize={20}
                    mainIcon={providerDescriptor?.icon ?? networkDescriptor?.icon}
                    badgeIcon={providerDescriptor?.icon ? networkDescriptor?.icon : undefined}
                    iconFilterColor={providerDescriptor?.iconFilterColor}
                />
                <Typography className={classes.walletName}>{walletName}</Typography>
                <Box mt={3} display="flex" gap={1} justifyContent="space-between">
                    <Box className={classes.button}>
                        <IconButton className={classes.iconButton}>
                            <CopyButton text={account} size={16} />
                        </IconButton>
                        <Typography className={classes.text}>Copy</Typography>
                    </Box>
                    <Box className={classes.button}>
                        <Link
                            href={EVMExplorerResolver.addressLink(chainId, account)}
                            target="_blank"
                            rel="noopener noreferrer">
                            <IconButton className={classes.iconButton}>
                                <Icons.LinkOut size={16} />
                            </IconButton>
                        </Link>

                        <Typography className={classes.text}>Explore</Typography>
                    </Box>
                    <Box className={classes.button}>
                        <IconButton
                            className={cx(classes.iconButton, classes.disconnectButton)}
                            onClick={handleDisconnect}>
                            <Icons.ShutDown size={16} />
                        </IconButton>
                        <Typography className={classes.text}>Disconnect</Typography>
                    </Box>
                </Box>
            </Box>
        </Popover>
    )
})
