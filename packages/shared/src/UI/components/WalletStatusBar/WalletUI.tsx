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
import { makeStyles, parseColor } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Link, Typography } from '@mui/material'
import { useState } from 'react'
import { LinkOutIcon } from '@masknet/icons'
import { DownIcon } from '../../assets/Down'
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
        marginLeft: 4,
    },
    link: {
        lineHeight: 0,
        marginLeft: 2,
    },
    linkIcon: {
        width: 14,
        height: 14,
        fontSize: 14,
        fill: theme.palette.maskColor?.second,
        cursor: 'pointer',
        marginLeft: 4,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
    },
    pending: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: parseColor(theme.palette.maskColor?.warn).setAlpha(0.1).toRgbString(),
        padding: 2,
        marginLeft: 4,
    },
    walletName: {
        color: theme.palette.maskColor?.main,
        fontWeight: 700,
        fontSize: 14,
    },
    walletAddress: {
        color: theme.palette.maskColor?.second,
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
                    iconFilterColor={providerDescriptor.iconFilterColor}
                />
            ) : (
                <ImageIcon size={30} icon={networkDescriptor?.icon} />
            )}
            <Box className={classes.domain}>
                <Box className={classes.name}>
                    <Typography className={classes.walletName}>
                        {providerType === ProviderType.MaskWallet
                            ? name ?? domain ?? providerDescriptor?.name ?? formatAddress(address, 4)
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
                        <LinkOutIcon className={classes.linkIcon} />
                    </Link>
                    {lock ? <LockWalletIcon className={classes.linkIcon} /> : null}
                    {pending ? <Box className={classes.pending}>{pending}</Box> : null}
                </Box>
            </Box>
        </Box>
    )
}
