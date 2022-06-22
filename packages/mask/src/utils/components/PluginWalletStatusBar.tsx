import { useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletButtonActionProps, WalletStatusBar } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import Services from '../../extension/service'

interface WalletStatusBarProps extends withClasses<'button' | 'disabled'> {
    className?: string
    userId?: string
    actionProps?: WalletButtonActionProps
    onChange?: (address: string, pluginId: NetworkPluginID, chainId: ChainId) => void
    tooltip?: string | React.ReactElement | React.ReactNode
    haveMenu?: boolean
}

const useStyles = makeStyles()((theme) => ({}))
export function PluginWalletStatusBar(props: WalletStatusBarProps) {
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

    return (
        <WalletStatusBar
            className={className}
            classes={classes}
            iconSize={30}
            badgeSize={12}
            menuActionProps={{
                openPopupsWindow,
                userId,
                haveMenu,
                onConnectWallet: openSelectProviderDialog,
            }}
            buttonActionProps={actionProps}
            onChange={onChange}
            tooltip={tooltip}
        />
    )
}
