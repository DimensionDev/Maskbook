import { AllProviderTradeContext } from '@masknet/plugin-trader'
import { Appearance } from '@masknet/public-api'
import { SharedContextProvider } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { applyMaskColorVars, makeStyles } from '@masknet/theme'
import { ChainContextProvider, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ThemeProvider, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useI18N } from '../../../../utils/index.js'
import { useSwapPageTheme } from '../../../../utils/theme/useSwapPageTheme.js'
import { NetworkSelector } from '../../components/NetworkSelector/index.js'
import { useTokenParams } from '../../hook/useTokenParams.js'
import { SwapBox } from './SwapBox/index.js'

const useStyles = makeStyles()((theme) => {
    return {
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
    const { chainId } = useTokenParams()
    applyMaskColorVars(document.body, Appearance.light)
    const chainContextValue = useMemo(() => ({ chainId }), [chainId])

    return (
        <ThemeProvider theme={theme}>
            <SharedContextProvider>
                <ChainContextProvider value={chainContextValue}>
                    <div className={classes.page}>
                        <div className={classes.container}>
                            <header className={classes.header}>
                                <Typography variant="h1" className={classes.title}>
                                    {t('plugin_trader_swap')}
                                </Typography>
                                <NetworkSelector />
                            </header>
                            <main className={classes.main}>
                                <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                                    <AllProviderTradeContext.Provider>
                                        <SwapBox />
                                    </AllProviderTradeContext.Provider>
                                </Web3ContextProvider>
                            </main>
                        </div>
                    </div>
                </ChainContextProvider>
            </SharedContextProvider>
        </ThemeProvider>
    )
}
