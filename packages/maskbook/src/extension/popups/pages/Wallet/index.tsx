import { WalletStartUp } from './components/StartUp'
import { EthereumRpcType, useWallet, useWallets } from '@masknet/web3-shared'
import { WalletAssets } from './components/WalletAssets'
import { Route, Switch, useHistory } from 'react-router-dom'
import { lazy, useEffect } from 'react'
import { PopupRoutes } from '../../index'
import { WalletContext } from './hooks/useWalletContext'
import { useUnconfirmedRequest } from './hooks/useUnConfirmedRequest'
import { useWalletLockStatus } from './hooks/useWalletLockStatus'
import { WalletMessages } from '@masknet/plugin-wallet'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'

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
const Transfer = lazy(() => import('./Transfer'))
const ContractInteraction = lazy(() => import('./ContractInteraction'))
const Unlock = lazy(() => import('./Unlock'))

export default function Wallet() {
    const wallet = useWallet()
    const wallets = useWallets()

    const history = useHistory()

    const { value, loading: getRequestLoading } = useUnconfirmedRequest()
    const { value: lockStatus, retry, loading } = useWalletLockStatus()

    WalletMessages.events.walletLockStatusUpdated.on(retry)

    useEffect(() => {
        if (value?.computedPayload) {
            switch (value.computedPayload.type) {
                case EthereumRpcType.SIGN:
                    history.push(PopupRoutes.WalletSignRequest)
                    break
                case EthereumRpcType.CONTRACT_INTERACTION:
                case EthereumRpcType.SEND_ETHER:
                    history.push(PopupRoutes.ContractInteraction)
                    break
                default:
                    break
            }
        }
    }, [value])

    useEffect(() => {
        if (lockStatus) {
            history.push(PopupRoutes.Unlock)
        }
    }, [lockStatus])

    return (
        <WalletContext.Provider>
            {getRequestLoading || loading ? (
                <LoadingPlaceholder />
            ) : (
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
                    <Route path={PopupRoutes.Transfer} children={<Transfer />} exact />
                    <Route path={PopupRoutes.ContractInteraction} children={<ContractInteraction />} />
                    <Route path={PopupRoutes.Unlock} children={<Unlock />} />
                </Switch>
            )}
        </WalletContext.Provider>
    )
}
