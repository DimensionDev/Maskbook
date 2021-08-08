import { WalletStartUp } from './components/StartUp'
import { useWallet, useWallets } from '@masknet/web3-shared'
import { WalletAssets } from './components/WalletAssets'
import { Route, Switch } from 'react-router-dom'
import { lazy } from 'react'
import { DialogRoutes } from '../../index'
import { WalletContext } from './hooks/useWalletContext'

const ImportWallet = lazy(() => import('./ImportWallet'))
const AddDeriveWallet = lazy(() => import('./AddDeriveWallet'))
const WalletSettings = lazy(() => import('./WalletSettings'))
const WalletRename = lazy(() => import('./WalletRename'))
const DeleteWallet = lazy(() => import('./DeleteWallet'))
const CreateWallet = lazy(() => import('./CreateWallet'))
const SelectWallet = lazy(() => import('./SelectWallet'))
const BackupWallet = lazy(() => import('./BackupWallet'))
const AddToken = lazy(() => import('./AddToken'))
const TokenDetail = lazy(() => import('./TokenDetail'))

export default function Wallet() {
    const wallet = useWallet()
    const wallets = useWallets()

    return (
        <WalletContext.Provider>
            <Switch>
                <Route path={DialogRoutes.Wallet} exact>
                    {wallets.length === 0 || !wallet ? <WalletStartUp /> : <WalletAssets />}
                </Route>
                <Route path={DialogRoutes.ImportWallet} children={<ImportWallet />} exact />
                <Route path={DialogRoutes.AddDeriveWallet} children={<AddDeriveWallet />} exact />
                <Route path={DialogRoutes.WalletSettings} children={<WalletSettings />} exact />
                <Route path={DialogRoutes.WalletRename} children={<WalletRename />} exact />
                <Route path={DialogRoutes.DeleteWallet} children={<DeleteWallet />} exact />
                <Route path={DialogRoutes.CreateWallet} children={<CreateWallet />} exact />
                <Route path={DialogRoutes.SelectWallet} children={<SelectWallet />} exact />
                <Route path={DialogRoutes.BackupWallet} children={<BackupWallet />} exact />
                <Route path={DialogRoutes.AddToken} children={<AddToken />} exact />
                <Route path={DialogRoutes.TokenDetail} children={<TokenDetail />} exact />
            </Switch>
        </WalletContext.Provider>
    )
}
