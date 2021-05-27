import { Button } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useWallets } from '@dimensiondev/web3-shared'
import { StartUp } from './StartUp'
import { TokenAssets } from './components/TokenAssets'
import { WalletContext } from './hooks/useWalletContext'
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
            primaryAction={<Button>Connect Wallet</Button>}>
            {wallets.length === 0 ? (
                <StartUp />
            ) : (
                <>
                    <Balance balance={0.1} onSend={() => {}} onBuy={() => {}} onSwap={() => {}} onReceive={() => {}} />
                    <Switch>
                        <Route exact path={path} children={<TokenAssets />}></Route>
                        <Route exact path={Routes.WalletsTransfer} children={<Transfer />} />
                    </Switch>
                </>
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
