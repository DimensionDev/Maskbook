import { Box, Button } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useWallets } from '@dimensiondev/web3-shared'
import { StartUp } from './StartUp'
import { TokenAssets } from './components/TokenAssets'
import { WalletContext } from './hooks'
import { Route, Switch, useRouteMatch } from 'react-router'
import { Balance } from './components/Balance'
import { Routes } from '../../type'
import { Transfer } from './components/Transfer'

function Wallets() {
    const wallets = useWallets()
    const { path } = useRouteMatch()
    return (
        <PageFrame
            title={wallets.length === 0 ? 'Create a Wallet' : 'Market'}
            noBackgroundFill
            primaryAction={<Button>Connect Wallet</Button>}>
            {wallets.length === 0 ? (
                <StartUp />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Balance balance={0.1} onSend={() => {}} onBuy={() => {}} onSwap={() => {}} />
                    <Switch>
                        <Route exact path={path} children={<TokenAssets />}></Route>
                        <Route exact path={Routes.WalletsTransfer} children={<Transfer />} />
                    </Switch>
                </Box>
            )}
        </PageFrame>
    )
}

export default function () {
    return (
        <WalletContext.Provider>
            <Wallets />
        </WalletContext.Provider>
    )
}
