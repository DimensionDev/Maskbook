import { WalletStatusBar } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { useChainId } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { useNextIDWallets } from '../../components/DataSource/useNextID'
import Services from '../../extension/service'

interface WalletStatusBarProps extends withClasses<'button'> {
    actionProps?: {
        title?: string | React.ReactElement | React.ReactNode
        action?: () => void
        disabled?: boolean
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        loading?: boolean
        color?: 'warning'
    }
}

export function PluginWalletStatusBar(props: WalletStatusBarProps) {
    const { actionProps } = props
    const chainId = useChainId()
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }, [chainId])

    const { loading, value: wallets = [] } = useNextIDWallets()

    return (
        <WalletStatusBar
            iconSize={30}
            badgeSize={12}
            actionProps={{ ...actionProps, openPopupsWindow, wallets, loading }}
        />
    )
}
