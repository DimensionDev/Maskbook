import { useChainId, useCurrentWeb3NetworkPluginID, useRecentTransactions } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletButtonActionProps, WalletStatusBar } from '@masknet/shared'
import { NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NetworkPluginID, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { CircularProgress, Typography } from '@mui/material'
import { useCallback } from 'react'
import Services from '../../extension/service'
import { activatedSocialNetworkUI } from '../../social-network'
import { useNextIDWallets } from '../hooks'
import { useI18N } from '../i18n-next-ui'

interface WalletStatusBarProps extends withClasses<'button' | 'disabled'> {
    className?: string
    userId?: string
    actionProps?: WalletButtonActionProps
    onChange?: (address: string, pluginId: NetworkPluginID, chainId: ChainId) => void
    tooltip?: string | React.ReactElement | React.ReactNode
    haveMenu?: boolean
}

const useStyles = makeStyles()((theme) => ({
    pedding: {
        color: theme.palette.maskColor?.warn,
        marginRight: 2,
    },
    progress: {
        color: theme.palette.maskColor?.warn,
    },
}))
export function PluginWalletStatusBar(props: WalletStatusBarProps) {
    const { t } = useI18N()
    const { actionProps, haveMenu = false, className, onChange, tooltip, userId } = props
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId(currentPluginId)
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }, [chainId])
    const classes = useStylesExtends(useStyles(), props)
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const { value: wallets = [] } = useNextIDWallets(
        userId,
        activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform,
    )
    const pendingTransactions = useRecentTransactions(currentPluginId, TransactionStatusType.NOT_DEPEND)

    function renderButtonText() {
        if (pendingTransactions.length <= 0) return
        return (
            <>
                <Typography fontSize={14} fontWeight={400} className={classes.pedding}>
                    {t('pending')}
                </Typography>
                <CircularProgress thickness={6} size={12} className={classes.progress} />
            </>
        )
    }

    return (
        <WalletStatusBar
            className={className}
            classes={classes}
            iconSize={30}
            badgeSize={12}
            menuActionProps={{
                openPopupsWindow,
                nextIDWallets: wallets,
                haveMenu,
                onConnectWallet: openSelectProviderDialog,
                pending: renderButtonText(),
            }}
            buttonActionProps={actionProps}
            onChange={onChange}
            tooltip={tooltip}
        />
    )
}
