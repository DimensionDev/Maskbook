import { useState } from 'react'
import { makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { CreateForm } from '../../../plugins/ITO/UI/CreateForm'
import type { PoolSettings } from '../../../plugins/ITO/hooks/useFillCallback'
import { ChainState } from '../../../web3/state/useChainState'
import { useI18N, extendsTheme } from '../../../utils'

import DashboardRouterContainer from './Container'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    balance: {
        border: theme.palette.grey[200],
    },
    form: {
        width: 640,
    },
}))

const tokenTheme = extendsTheme((theme) => ({}))

export function DashboardTokenRouter() {
    const { t } = useI18N()
    const classes = useStyles()
    const [poolSettings, setPoolSettings] = useState<PoolSettings>()
    //#endregion

    const handleNext = () => {}

    return (
        <DashboardRouterContainer title={t('token')}>
            <ThemeProvider theme={tokenTheme}>
                <ChainState.Provider>
                    <CreateForm onNext={handleNext} origin={poolSettings} onChangePoolSettings={setPoolSettings} />
                </ChainState.Provider>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
