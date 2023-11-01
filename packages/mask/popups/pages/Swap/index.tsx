import { AllProviderTradeContext } from '@masknet/plugin-trader'
import { Appearance } from '@masknet/public-api'
import { SharedContextProvider, SwapPageModals } from '@masknet/shared'
import { applyMaskColorVars, makeStyles } from '@masknet/theme'
import { ChainContextProvider, DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { useMaskSharedTrans } from '../../../../utils/index.js'
import { NetworkSelector } from '../../components/NetworkSelector/index.js'
import { useTokenParams } from '../../hooks/index.js'
import { SwapBox } from './SwapBox/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        page: {
            minHeight: '100vh',
            maxWidth: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.maskColor.bg,
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
            color: theme.palette.maskColor.second,
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
    const { t } = useMaskSharedTrans()
    const { classes } = useStyles()
    const { chainId } = useTokenParams()
    applyMaskColorVars(document.body, Appearance.light)
    const chainContextValue = useMemo(() => ({ chainId }), [chainId])

    return (
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
                            <DefaultWeb3ContextProvider>
                                <AllProviderTradeContext.Provider>
                                    <SwapBox />
                                </AllProviderTradeContext.Provider>
                            </DefaultWeb3ContextProvider>
                        </main>
                    </div>
                </div>
            </ChainContextProvider>
            <SwapPageModals />
        </SharedContextProvider>
    )
}
