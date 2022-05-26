import { WalletStatusBar } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { useChainId, TransactionStatusType } from '@masknet/web3-shared-evm'
import { CircularProgress, Typography, useTheme } from '@mui/material'
import { useCallback } from 'react'
import { useNextIDWallets } from '../../components/DataSource/useNextID'
import Services from '../../extension/service'
import { useRecentTransactions } from '../../plugins/Wallet/hooks'
import { useI18N } from '../i18n-next-ui'

interface WalletStatusBarProps extends withClasses<'button'> {
    className?: string
    actionProps?: {
        title?: string | React.ReactElement | React.ReactNode
        action?: () => Promise<void>
        disabled?: boolean
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        loading?: boolean
        color?: 'warning'
    }
    onChange?: (address: string) => void
}

export function PluginWalletStatusBar(props: WalletStatusBarProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const { actionProps, className, onChange } = props
    const chainId = useChainId()
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }, [chainId])
    const { value: pendingTransactions = [] } = useRecentTransactions({
        status: TransactionStatusType.NOT_DEPEND,
    })
    const { loading, value: wallets = [] } = useNextIDWallets()

    function renderButtonText() {
        if (pendingTransactions.length <= 0) return
        return (
            <>
                <Typography
                    fontSize={14}
                    fontWeight={400}
                    style={{ color: theme.palette.maskColor.warn, marginRight: 2 }}>
                    {t('plugin_wallet_pending_status')}
                </Typography>
                <CircularProgress thickness={6} size={12} style={{ color: theme.palette.maskColor.warn }} />
            </>
        )
    }

    return (
        <WalletStatusBar
            className={className}
            iconSize={30}
            badgeSize={12}
            actionProps={{ ...actionProps, openPopupsWindow, wallets, loading }}
            onChange={(address: string) => onChange?.(address)}
            pending={renderButtonText()}
        />
    )
}
