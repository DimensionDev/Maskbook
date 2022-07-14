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
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, parseColor } from '@masknet/theme'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { Box, Button } from '@mui/material'
import { useI18N } from '../../i18n-next-ui'
import { PluginWalletConnectIcon } from '@masknet/icons'
import { useLayoutEffect, useRef, useState, PropsWithChildren, useMemo } from 'react'
import { ProviderType } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'
import { WalletDescription } from './WalletDescription'

interface WalletStatusBarProps extends PropsWithChildren<{}> {
    className?: string
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
    showConnect?: boolean
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
export function PluginWalletStatusBar({ className, children, onClick, showConnect = false }: WalletStatusBarProps) {
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
    const networkDescriptor = useNetworkDescriptor(currentPluginId, chainId)
    const { value: domain } = useReverseAddress(currentPluginId, account)
    const { Others } = useWeb3State<'all'>(currentPluginId)

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const pendingTransactions = useRecentTransactions(currentPluginId, TransactionStatusType.NOT_DEPEND)

    const walletName = useMemo(() => {
        if (domain) return domain
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name

        return providerDescriptor?.name || Others?.formatAddress(account, 4)
    }, [providerType, domain, wallet?.name, providerDescriptor?.name, Others?.formatAddress, account])

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
                    <PluginWalletConnectIcon className={classes.connection} /> {t('plugin_wallet_connect_a_wallet')}
                </Button>
            </Box>
        )
    }

    return (
        <Box className={cx(classes.root, className)}>
            <WalletDescription
                pending={!!pendingTransactions.length}
                providerIcon={providerDescriptor?.icon}
                networkIcon={networkDescriptor?.icon}
                iconFilterColor={providerDescriptor?.iconFilterColor}
                name={walletName}
                formattedAddress={Others?.formatAddress(account, 4)}
                addressLink={Others?.explorerResolver.addressLink?.(chainId, account)}
                onClick={openSelectProviderDialog}
                onPendingClick={openWalletStatusDialog}
            />

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
