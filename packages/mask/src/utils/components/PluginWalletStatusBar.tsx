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
} from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletIcon } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, parseColor } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material'
import { useI18N } from '../i18n-next-ui'
import { ProviderType } from '@masknet/web3-shared-evm'
import { LinkOutIcon, ArrowDropIcon, PluginWalletConnectIcon } from '@masknet/icons'
import { useLayoutEffect, useRef, useState, PropsWithChildren } from 'react'

interface WalletStatusBarProps extends PropsWithChildren<{}> {
    className?: string
    actionProps?: {}
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
}

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        backgroundColor: parseColor(theme.palette.maskColor?.bottom).setAlpha(0.8).toRgbString(),
        boxShadow: `0 0 20px ${parseColor(theme.palette.maskColor?.bottom).setAlpha(0.05).toRgbString()}`,
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    wallet: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        cursor: 'pointer',
    },
    description: {
        marginLeft: 4,
    },
    walletName: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        color: theme.palette.maskColor?.main,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
    },
    address: {
        color: theme.palette.maskColor?.second,
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
        backgroundColor: parseColor(theme.palette.maskColor?.warn).setAlpha(0.1).toRgbString(),
        color: theme.palette.maskColor?.warn,
        fontSize: 14,
        lineHeight: '18px',
    },
    progress: {
        color: theme.palette.maskColor?.warn,
    },
    linkIcon: {
        width: 14,
        height: 14,
        fontSize: 14,
        fill: theme.palette.maskColor?.second,
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
export function PluginWalletStatusBar({ className, children, onClick }: WalletStatusBarProps) {
    const ref = useRef<HTMLDivElement>()
    const { t } = useI18N()
    const [emptyChildren, setEmptyChildren] = useState(false)
    const currentPluginId = useCurrentWeb3NetworkPluginID()

    const account = useAccount(currentPluginId)
    const wallet = useWallet(currentPluginId)
    const chainId = useChainId(currentPluginId)
    const { classes, cx } = useStyles()

    const providerDescriptor = useProviderDescriptor()
    const providerType = useProviderType()
    const networkDescriptor = useNetworkDescriptor(currentPluginId)
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

    return (
        <Box className={cx(classes.root, className)}>
            {account ? (
                <>
                    <Box className={classes.wallet} onClick={onClick ?? openSelectProviderDialog}>
                        <WalletIcon
                            size={30}
                            badgeSize={12}
                            mainIcon={providerDescriptor?.icon}
                            badgeIcon={networkDescriptor?.icon}
                            iconFilterColor={providerDescriptor?.iconFilterColor}
                        />
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
                                <ArrowDropIcon />
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
                                        {t('wallet_status_bar_pending')}
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
                </>
            ) : (
                <Button fullWidth onClick={openSelectProviderDialog}>
                    <PluginWalletConnectIcon className={classes.connection} /> {t('plugin_wallet_connect_a_wallet')}
                </Button>
            )}
        </Box>
    )
}
