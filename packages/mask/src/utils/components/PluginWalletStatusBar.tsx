import { useNextIDWallets, WalletStatusBar } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useChainId, TransactionStatusType } from '@masknet/web3-shared-evm'
import { CircularProgress, Typography, useTheme } from '@mui/material'
import { useCallback } from 'react'
import { useLastRecognizedIdentity } from '../../components/DataSource/useActivatedUI'
import Services from '../../extension/service'
import { useRecentTransactions } from '../../plugins/Wallet/hooks'
import { useI18N } from '../i18n-next-ui'

interface WalletStatusBarProps extends withClasses<'button' | 'disabled'> {
    className?: string
    actionProps?: {
        title?: string | React.ReactElement | React.ReactNode
        action?: () => Promise<void>
        disabled?: boolean
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        loading?: boolean
        color?: 'warning'
        waiting?: string | React.ReactElement | React.ReactNode
    }
    onChange?: (address: string) => void
    tooltip?: string | React.ReactElement | React.ReactNode
    haveMenu?: boolean
}

const useStyles = makeStyles()((theme) => ({}))
export function PluginWalletStatusBar(props: WalletStatusBarProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const { actionProps, className, onChange, tooltip, haveMenu = false } = props
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
    const lastRecognized = useLastRecognizedIdentity()
    const { loading, value: wallets = [] } = useNextIDWallets(lastRecognized)
    const classes = useStylesExtends(useStyles(), props)
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
            haveMenu={haveMenu}
            className={className}
            classes={classes}
            iconSize={30}
            badgeSize={12}
            actionProps={{ ...actionProps, openPopupsWindow, wallets, loading }}
            onChange={(address: string) => onChange?.(address)}
            pending={renderButtonText()}
            tooltip={tooltip}
        />
    )
}
