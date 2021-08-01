import { WalletStartUp } from './components/StartUp'
import { useWallets } from '@masknet/web3-shared'
import { Route, Switch } from 'react-router-dom'
import { DialogRoutes } from '../../index'
import { ImportWallet } from './components/ImportWallet'
import { AddDeriveWallet } from './components/AddDeriveWallet'

export default function Wallet() {
    const wallets = useWallets()

    return wallets.length === 0 ? (
        <WalletStartUp />
    ) : (
        <Switch>
            <Route path={DialogRoutes.ImportWallet} children={<ImportWallet />} exact />
            <Route path={DialogRoutes.AddDeriveWallet} children={<AddDeriveWallet />} exact />
        </Switch>
    )
}
