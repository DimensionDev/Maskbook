import { Appearance, applyMaskColorVars, makeStyles } from '@masknet/theme'
import { ThemeProvider, Typography } from '@mui/material'
import { SharedContextProvider } from '@masknet/shared'
import { SwapBox } from './SwapBox'
import { useI18N } from '../../../../utils'
import { useSwapPageTheme } from '../../../../utils/theme/useSwapPageTheme'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { AllProviderTradeContext } from '../../../../plugins/Trader/trader/useAllProviderTradeContext'
import { NetworkSelector } from '../../components/NetworkSelector'

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
            width: 598,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '22px 16px',
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: theme.palette.grey['900'],
        },
        main: {
            width: 598,
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
    const theme = useSwapPageTheme()

    applyMaskColorVars(document.body, Appearance.light)

    return (
        <ThemeProvider theme={theme}>
            <SharedContextProvider>
                <div className={classes.page}>
                    <div className={classes.container}>
                        <header className={classes.header}>
                            <Typography variant="h1" className={classes.title}>
                                {t('plugin_trader_swap')}
                            </Typography>
                            <NetworkSelector />
                        </header>
                        <main className={classes.main}>
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
    )
}
