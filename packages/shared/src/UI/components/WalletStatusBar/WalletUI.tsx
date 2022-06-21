import {
    useChainColor,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptor,
    useProviderDescriptor,
    useProviderType,
    useReverseAddress,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { ImageIcon, WalletIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Link, Typography } from '@mui/material'
import Color from 'color'
import { useState } from 'react'
import { DownIcon } from '../../assets/Down'
import { LinkIcon } from '../../assets/Link'
import { LockWalletIcon } from '../../assets/Lock'
import { VerifyIcon } from '../../assets/verify'

const useStyles = makeStyles<{ filterColor: string }>()((theme, props) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    address: {
        display: 'flex',
        alignItems: 'center',
    },
    domain: {
        marginLeft: 9.53,
    },
    link: {
        lineHeight: 0,
        marginLeft: 4,
    },
    linkIcon: {
        width: 14,
        height: 14,
        fill: theme.palette.mode === 'dark' ? '#c4c7cd' : '#767f8d',
    },
    name: {
        display: 'flex',
        alignItems: 'center',
    },
    pending: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 177, 0, 0.1)',
        padding: 2,
        marginLeft: 4,
    },
    icon: {
        filter: `drop-shadow(0px 6px 12px ${new Color(props.filterColor).alpha(0.4).toString()})`,
    },
    walletName: {
        color: theme.palette.mode === 'dark' ? '#D9D9D9' : '#0F1419',
    },
    walletAddress: {
        color: theme.palette.mode === 'dark' ? '#6E767D' : '#536471',
    },
}))

interface WalletUIProps {
    address: string
    name?: string
    iconSize?: number
    badgeSize?: number
    verify?: boolean
    isETH?: boolean
    showMenuDrop?: boolean
    pending?: string | React.ReactElement | React.ReactNode
    showWalletIcon?: boolean
}

function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 20) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

export function WalletUI(props: WalletUIProps) {
    const {
        iconSize = 30,
        badgeSize = 12,
        name,
        verify = false,
        isETH = false,
        address,
        showMenuDrop = false,
        pending,
        showWalletIcon = false,
    } = props
    const chainColor = useChainColor()
    const { classes } = useStyles({ filterColor: chainColor })
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const providerType = useProviderType()
    const providerDescriptor = useProviderDescriptor()
    const [lock, setLock] = useState(false)

    const chainId = useChainId(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId)
    const networkDescriptor = useNetworkDescriptor(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId, chainId)
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, address)
    const { Others } = useWeb3State<'all'>(isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId)

    return (
        <Box className={classes.root}>
            {showWalletIcon ? (
                <WalletIcon
                    size={iconSize}
                    badgeSize={badgeSize}
                    mainIcon={providerDescriptor?.icon}
                    badgeIcon={networkDescriptor?.icon}
                />
            ) : (
                <ImageIcon size={30} icon={networkDescriptor?.icon} />
            )}
            <Box className={classes.domain}>
                <Box className={classes.name}>
                    <Typography className={classes.walletName} fontWeight={700} fontSize={14}>
                        {providerType === ProviderType.MaskWallet
                            ? domain ?? name ?? providerDescriptor?.name ?? formatAddress(address, 4)
                            : domain ?? providerDescriptor?.name ?? formatAddress(address, 4)}
                    </Typography>
                    {verify ? <VerifyIcon style={{ width: 14, height: 14, marginLeft: 4 }} /> : null}
                    {showMenuDrop ? <DownIcon /> : null}
                </Box>
                <Box className={classes.address}>
                    <Typography variant="body2" color="textSecondary" fontSize={14}>
                        {formatAddress(address, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink?.(chainId as ChainId, address) ?? ''}
                        target="_blank"
                        title="View on Explorer"
                        rel="noopener noreferrer">
                        <LinkIcon className={classes.linkIcon} />
                    </Link>
                    {lock ? <LockWalletIcon className={classes.linkIcon} /> : null}
                    {pending ? <Box className={classes.pending}>{pending}</Box> : null}
                </Box>
            </Box>
        </Box>
    )
}
