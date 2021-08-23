import { WalletStartUp } from './components/StartUp'
import { useWallet, useWallets } from '@masknet/web3-shared'
import { WalletAssets } from './components/WalletAssets'
import { Route, Switch } from 'react-router-dom'
import { lazy } from 'react'
import { PopupRoutes } from '../../index'
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
const SignRequest = lazy(() => import('./SignRequest'))
const GasSetting = lazy(() => import('./GasSetting'))

export default function Wallet() {
    const wallet = useWallet()
    const wallets = useWallets()

    return (
        <WalletContext.Provider>
            <Switch>
                <Route path={PopupRoutes.Wallet} exact>
                    {wallets.length === 0 || !wallet ? <WalletStartUp /> : <WalletAssets />}
                </Route>
                <Route path={PopupRoutes.ImportWallet} children={<ImportWallet />} exact />
                <Route path={PopupRoutes.AddDeriveWallet} children={<AddDeriveWallet />} exact />
                <Route path={PopupRoutes.WalletSettings} children={<WalletSettings />} exact />
                <Route path={PopupRoutes.WalletRename} children={<WalletRename />} exact />
                <Route path={PopupRoutes.DeleteWallet} children={<DeleteWallet />} exact />
                <Route path={PopupRoutes.CreateWallet} children={<CreateWallet />} exact />
                <Route path={PopupRoutes.SelectWallet} children={<SelectWallet />} exact />
                <Route path={PopupRoutes.BackupWallet} children={<BackupWallet />} exact />
                <Route path={PopupRoutes.AddToken} children={<AddToken />} exact />
                <Route path={PopupRoutes.WalletSignRequest} children={<SignRequest />} />
                <Route path={PopupRoutes.GasSetting} children={<GasSetting />} />
                <Route path={PopupRoutes.TokenDetail} children={<TokenDetail />} exact />
            </Switch>
        </WalletContext.Provider>
    )
}
