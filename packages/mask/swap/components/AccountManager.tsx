import { Icons } from '@masknet/icons'
import { CopyButton, WalletIcon, type CopyButtonRef } from '@masknet/shared'
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
import { memo, useCallback, useRef } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        backgroundColor: alpha(theme.palette.maskColor.white, 0.2),
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px 0px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
        marginTop: theme.spacing(2),
        borderRadius: 12,
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
        color: theme.palette.maskColor.main,
        borderRadius: 99,
        padding: theme.spacing(1.5),
    },
    disconnectButton: {
        background: alpha(theme.palette.maskColor.danger, 0.1),
        color: theme.palette.maskColor.danger,
    },
    text: {
        marginTop: theme.spacing(0.5),
        fontSize: 10,
        lineHeight: '10px',
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
    const copyIconRef = useRef<CopyButtonRef>(null)
    const { classes, cx } = useStyles()
    const { pluginID } = useNetworkContext()
    const { account, chainId, providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const providerDescriptor = useProviderDescriptor(pluginID)
    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)

    const handleDisconnect = useCallback(async () => {
        await EVMWeb3.disconnect({
            providerType,
        })
        onClose()
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
                        <IconButton
                            className={classes.iconButton}
                            onClick={(event) => {
                                copyIconRef.current?.handleCopy(event)
                            }}>
                            <CopyButton ref={copyIconRef} text={account} size={16} />
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
