import { Appearance, applyMaskColorVars, makeStyles } from '@masknet/theme'
import { TransactionStatusType, useChainId, useWallet, Web3Provider } from '@masknet/web3-shared-evm'
import { ThemeProvider, Typography } from '@mui/material'
import { SharedContextProvider } from '@masknet/shared'
import { useCallback } from 'react'
import { useRecentTransactions } from '../../../../plugins/Wallet/hooks/useRecentTransactions'
import Services from '../../../service'
import { WalletStateBarUI } from '../../components/WalletStateBar'
import { SwapBox } from './SwapBox'
import { SwapWeb3Context } from '../../../../web3/context'
import { PopupRoutes } from '@masknet/shared-base'
import { useI18N } from '../../../../utils'
import { useSwapPageTheme } from '../../../../utils/theme/useSwapPageTheme'
import { NetworkPluginID, useReverseAddress } from '@masknet/plugin-infra/web3'
import { TargetChainIdContext } from '../../../../plugins/Trader/trader/useTargetChainIdContext'
import { AllProviderTradeContext } from '../../../../plugins/Trader/trader/useAllProviderTradeContext'

const useStyles = makeStyles()((theme) => {
    return {
        walletStateBar: {
            color: theme.palette.grey['900'],
        },
        page: {
            minHeight: '100vh',
            maxWidth: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F7F9FA',
        },
        container: {
            width: 800,
            backgroundColor: theme.palette.background.paper,
            marginLeft: 'auto',
            marginRight: 'auto',
            minHeight: 720,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 16,
            padding: '32px 0',
        },
        header: {
            width: 520,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: '22px 0',
        },
        title: {
            fontSize: 32,
            marginTop: 16,
            fontWeight: 'bold',
            color: theme.palette.grey['900'],
        },
        main: {
            width: 520,
            overflowY: 'scroll',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

export default function SwapPage() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const theme = useSwapPageTheme()
    const { value: pendingTransactions = [] } = useRecentTransactions({
        status: TransactionStatusType.NOT_DEPEND,
    })
    const wallet = useWallet()
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.SelectWallet, {
            chainId,
            internal: true,
        })
    }, [chainId])

    const { value: domain } = useReverseAddress(wallet?.address, NetworkPluginID.PLUGIN_EVM)

    applyMaskColorVars(document.body, Appearance.light)

    return (
        <Web3Provider value={SwapWeb3Context}>
            <ThemeProvider theme={theme}>
                <SharedContextProvider>
                    <div className={classes.page}>
                        <div className={classes.container}>
                            <header className={classes.header}>
                                <WalletStateBarUI
                                    className={classes.walletStateBar}
                                    isPending={pendingTransactions.length > 0}
                                    openConnectWalletDialog={openPopupsWindow}
                                    walletName={wallet?.name}
                                    domain={domain}
                                    walletAddress={wallet?.address}
                                />
                            </header>
                            <main className={classes.main}>
                                <Typography variant="h1" className={classes.title}>
                                    {t('plugin_trader_swap')}
                                </Typography>
                                <TargetChainIdContext.Provider>
                                    <AllProviderTradeContext.Provider>
                                        <SwapBox />
                                    </AllProviderTradeContext.Provider>
                                </TargetChainIdContext.Provider>
                            </main>
                        </div>
                    </div>
                </SharedContextProvider>
            </ThemeProvider>
        </Web3Provider>
    )
}
