import { makeStyles } from '@masknet/theme'
import { NetworkIcon, PluginWalletStatusBar, TokenIcon } from '@masknet/shared'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useNetworks } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    view: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        minHeight: 0,
        flexGrow: 1,
        overflow: 'auto',
    },
    box: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1.5),
        borderRadius: 12,
        display: 'flex',
        gap: theme.spacing(1),
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    icon: {
        position: 'relative',
        width: 30,
        height: 30,
    },
    tokenIcon: {
        height: 30,
        width: 30,
    },
    badgeIcon: {
        position: 'absolute',
        right: -3,
        bottom: -2,
    },
    symbol: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    chain: {
        fontSize: 13,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    tokenInput: {
        height: '100%',
        width: '100%',
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        border: 'none',
        backgroundColor: 'transparent',
        outline: 'none',
        textAlign: 'right',
    },
    tokenValue: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    lost: {
        color: theme.palette.maskColor.danger,
        marginLeft: theme.spacing(0.5),
    },
    footer: {
        flexShrink: 0,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
}))

export function SwapView() {
    const { classes } = useStyles()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const network = networks.find((x) => x.chainId === 1)

    return (
        <div className={classes.view}>
            <Box className={classes.container}>
                <Box className={classes.box}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography lineHeight="18px" fontWeight="700" fontSize="14px">
                            From
                        </Typography>
                        <Box display="flex" flexDirection="row">
                            <Box className={classes.token}>
                                <Box className={classes.icon}>
                                    <TokenIcon className={classes.tokenIcon} chainId={1} address="0xxx" logoURL="0xx" />
                                    <NetworkIcon
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                        className={classes.badgeIcon}
                                        chainId={1}
                                        size={12}
                                        network={network}
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        ETH
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        on Ethereum
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
                            <input className={classes.tokenInput} />
                            <Typography className={classes.tokenValue}>$10M</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.box}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography lineHeight="18px" fontWeight="700" fontSize="14px">
                            To
                        </Typography>
                        <Box display="flex" flexDirection="row">
                            <Box className={classes.token}>
                                <Box className={classes.icon}>
                                    <TokenIcon className={classes.tokenIcon} chainId={1} address="0xxx" logoURL="0xx" />
                                    <NetworkIcon
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                        className={classes.badgeIcon}
                                        chainId={1}
                                        size={12}
                                        network={network}
                                    />
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="strong" className={classes.symbol}>
                                        ETH
                                    </Typography>
                                    <Typography component="span" className={classes.chain}>
                                        on Ethereum
                                    </Typography>
                                </Box>
                                <Icons.ArrowDrop size={16} />
                            </Box>
                        </Box>
                    </Box>
                    <Box flexGrow={1}>
                        <Box height="100%" position="relative">
                            <input className={classes.tokenInput} />
                            <Typography className={classes.tokenValue}>
                                $10M
                                <span className={classes.lost}>(-10.00%)</span>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <PluginWalletStatusBar className={classes.footer} requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} />
        </div>
    )
}
