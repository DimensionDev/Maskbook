import {
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useProviderDescriptor,
    useRecentTransactions,
    useNetworkDescriptor,
    useAccount,
    useWallet,
    useReverseAddress,
    useWeb3State,
    useProviderType,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ImageIcon, WalletIcon } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, parseColor } from '@masknet/theme'
import { NetworkPluginID, TransactionStatusType, Wallet } from '@masknet/web3-shared-base'
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material'
import { useI18N } from '../i18n-next-ui'
import { LinkOutIcon, ArrowDropIcon, WalletConnect } from '@masknet/icons'
import { useLayoutEffect, useRef, useState, PropsWithChildren } from 'react'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'

interface WalletStatusBarProps extends PropsWithChildren<{}> {
    className?: string
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
    showConnect?: boolean
    onlyNetworkIcon?: boolean
    expectedAccount?: string
    expectedWallet?: Wallet | null
    expectedProviderType?: Web3Helper.ProviderTypeAll
    expectedPluginID?: NetworkPluginID
    expectedChainIdOrNetworkTypeOrID?: string | number
}

const isDashboard = isDashboardPage()

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor: isDashboard
            ? MaskColorVar.mainBackground
            : parseColor(theme.palette.maskColor.bottom).setAlpha(0.8).toRgbString(),
        boxShadow: `0 0 20px ${parseColor(theme.palette.maskColor.highlight).setAlpha(0.2).toRgbString()}`,
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
    },
    wallet: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        cursor: 'pointer',
    },
    description: {
        marginLeft: 11,
    },
    walletName: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
    },
    pending: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        padding: '2px 4px',
        backgroundColor: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
        color: theme.palette.maskColor.warn,
        fontSize: 14,
        lineHeight: '18px',
    },
    progress: {
        color: theme.palette.maskColor.warn,
    },
    linkIcon: {
        width: 14,
        height: 14,
        fontSize: 14,
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
    },
    action: {
        display: 'flex',
        columnGap: 16,
        minWidth: 276,
    },
    connection: {
        width: 18,
        height: 18,
        marginRight: 8,
    },
}))
export function PluginWalletStatusBar({
    className,
    children,
    onClick,
    showConnect = false,
    expectedWallet,
    expectedAccount,
    expectedPluginID,
    expectedProviderType,
    onlyNetworkIcon = false,
}: WalletStatusBarProps) {
    const ref = useRef<HTMLDivElement>()
    const { t } = useI18N()
    const [emptyChildren, setEmptyChildren] = useState(false)
    const currentPluginId = useCurrentWeb3NetworkPluginID(expectedPluginID)

    const account = useAccount(currentPluginId, expectedAccount)
    const currentWallet = useWallet(currentPluginId)

    const wallet = expectedWallet ?? currentWallet

    const chainId = useChainId(currentPluginId)
    const { classes, cx } = useStyles()

    const providerDescriptor = useProviderDescriptor(expectedPluginID, expectedProviderType)

    const providerType = useProviderType(expectedPluginID)
    const networkDescriptor = useNetworkDescriptor(
        onlyNetworkIcon ? NetworkPluginID.PLUGIN_EVM : currentPluginId,
        onlyNetworkIcon ? ChainId.Mainnet : chainId,
    )
    const { value: domain } = useReverseAddress(currentPluginId, account)
    const { Others } = useWeb3State<'all'>(currentPluginId)

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const pendingTransactions = useRecentTransactions(currentPluginId, TransactionStatusType.NOT_DEPEND)

    useLayoutEffect(() => {
        if (ref.current?.children.length && ref.current.children.length > 1) {
            setEmptyChildren(false)
        } else {
            setEmptyChildren(true)
        }
    }, [children])

    if (showConnect || !account) {
        return (
            <Box className={cx(classes.root, className)}>
                <Button fullWidth onClick={openSelectProviderDialog}>
                    <WalletConnect className={classes.connection} /> {t('plugin_wallet_connect_a_wallet')}
                </Button>
            </Box>
        )
    }

    return (
        <Box className={cx(classes.root, className)}>
            <Box className={classes.wallet} onClick={onClick ?? openSelectProviderDialog}>
                {onlyNetworkIcon ? (
                    <ImageIcon size={30} icon={networkDescriptor?.icon} />
                ) : (
                    <WalletIcon
                        size={30}
                        badgeSize={12}
                        mainIcon={providerDescriptor?.icon}
                        badgeIcon={networkDescriptor?.icon}
                        iconFilterColor={providerDescriptor?.iconFilterColor}
                    />
                )}
                <Box className={classes.description}>
                    <Typography className={classes.walletName}>
                        <span>
                            {providerType === ProviderType.MaskWallet
                                ? domain ??
                                  wallet?.name ??
                                  providerDescriptor?.name ??
                                  Others?.formatAddress(account, 4)
                                : domain ?? providerDescriptor?.name ?? Others?.formatAddress(account, 4)}
                        </span>

                        <ArrowDropIcon sx={{ fill: '#767F8D' }} />
                    </Typography>
                    <Typography className={classes.address}>
                        <span>{Others?.formatAddress(account, 4)}</span>
                        <Link
                            href={Others?.explorerResolver.addressLink?.(chainId, account) ?? ''}
                            target="_blank"
                            title="View on Explorer"
                            rel="noopener noreferrer"
                            className={classes.linkIcon}>
                            <LinkOutIcon className={classes.linkIcon} />
                        </Link>
                        {pendingTransactions.length ? (
                            <span
                                className={classes.pending}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    openWalletStatusDialog()
                                }}>
                                {t('recent_transaction_pending')}
                                <CircularProgress thickness={6} size={12} className={classes.progress} />
                            </span>
                        ) : null}
                    </Typography>
                </Box>
            </Box>
            <Box className={classes.action} ref={ref}>
                <Button
                    fullWidth
                    onClick={openSelectProviderDialog}
                    style={{ display: !emptyChildren ? 'none' : undefined }}>
                    {t('wallet_status_button_change')}
                </Button>
                {children}
            </Box>
        </Box>
    )
}
