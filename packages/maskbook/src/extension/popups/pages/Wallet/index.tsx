import { WalletStartUp } from './components/StartUp'
import { EthereumRpcType, ProviderType, useWallet, useWallets } from '@masknet/web3-shared-evm'
import { WalletAssets } from './components/WalletAssets'
import { Route, Switch, useHistory } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { PopupRoutes } from '../../index'
import { WalletContext } from './hooks/useWalletContext'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'
import { useLocation } from 'react-router-dom'
import { useAsyncRetry } from 'react-use'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages'
import Services from '../../../service'
import SelectWallet from './SelectWallet'
import { useWalletLockStatus } from './hooks/useWalletLockStatus'
import { first } from 'lodash-es'
import { currentAccountSettings } from '../../../../plugins/Wallet/settings'
import urlcat from 'urlcat'

const ImportWallet = lazy(() => import('./ImportWallet'))
const AddDeriveWallet = lazy(() => import('./AddDeriveWallet'))
const WalletSettings = lazy(() => import('./WalletSettings'))
const WalletRename = lazy(() => import('./WalletRename'))
const DeleteWallet = lazy(() => import('./DeleteWallet'))
const CreateWallet = lazy(() => import('./CreateWallet'))
const SwitchWallet = lazy(() => import('./SwitchWallet'))
const BackupWallet = lazy(() => import('./BackupWallet'))
const AddToken = lazy(() => import('./AddToken'))
const TokenDetail = lazy(() => import('./TokenDetail'))
const SignRequest = lazy(() => import('./SignRequest'))
const GasSetting = lazy(() => import('./GasSetting'))
const Transfer = lazy(() => import('./Transfer'))
const ContractInteraction = lazy(() => import('./ContractInteraction'))
const Unlock = lazy(() => import('./Unlock'))
const SetPaymentPassword = lazy(() => import('./SetPaymentPassword'))
const WalletRecovery = lazy(() => import('./WalletRecovery'))
const LegacyWalletRecovery = lazy(() => import('./LegacyWalletRecovery'))
const ReplaceTransaction = lazy(() => import('./ReplaceTransaction'))

export default function Wallet() {
    const wallet = useWallet()
    const location = useLocation()
    const history = useHistory()
    const wallets = useWallets(ProviderType.MaskWallet)

    const { isLocked, loading: getLockStatusLoading } = useWalletLockStatus()

    const { loading, retry } = useAsyncRetry(async () => {
        if (
            [
                PopupRoutes.ContractInteraction,
                PopupRoutes.WalletSignRequest,
                PopupRoutes.GasSetting,
                PopupRoutes.Unlock,
            ].some((item) => item === location.pathname)
        )
            return

        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return

        const computedPayload = await Services.Ethereum.getComputedPayload(payload)
        const value = {
            payload,
            computedPayload,
        }

        if (value?.computedPayload) {
            switch (value.computedPayload.type) {
                case EthereumRpcType.SIGN:
                    history.replace(PopupRoutes.WalletSignRequest)
                    break
                case EthereumRpcType.CONTRACT_INTERACTION:
                case EthereumRpcType.SEND_ETHER:
                    history.replace(PopupRoutes.ContractInteraction)
                    break
                default:
                    break
            }
        }
    }, [location.search, location.pathname])

    useEffect(() => {
        if (
            isLocked &&
            !getLockStatusLoading &&
            ![PopupRoutes.WalletRecovered, PopupRoutes.Unlock].some((item) => item === location.pathname)
        ) {
            history.replace(urlcat(PopupRoutes.Unlock, { from: location.pathname }))
            return
        }
    }, [isLocked, location.pathname, getLockStatusLoading])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(({ hasRequest }) => {
            if (hasRequest) retry()
        })
    }, [retry])

    useEffect(() => {
        if (!wallet && wallets.length) {
            WalletRPC.updateMaskAccount({
                account: first(wallets)?.address,
            })

            if (!currentAccountSettings.value)
                WalletRPC.updateAccount({
                    account: first(wallets)?.address,
                    providerType: ProviderType.MaskWallet,
                })
        }
    }, [wallets, wallet])

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <WalletContext.Provider>
                {loading ? (
                    <LoadingPlaceholder />
                ) : (
                    <Switch>
                        <Route path={PopupRoutes.WalletRecovered} children={<WalletRecovery />} exact />
                        <Route path={PopupRoutes.LegacyWalletRecovered} children={<LegacyWalletRecovery />} exact />
                        <Route path={PopupRoutes.Wallet} exact>
                            {!wallet ? <WalletStartUp /> : <WalletAssets />}
                        </Route>
                        <Route path={PopupRoutes.ImportWallet} children={<ImportWallet />} exact />
                        <Route path={PopupRoutes.AddDeriveWallet} children={<AddDeriveWallet />} exact />
                        <Route path={PopupRoutes.WalletSettings} children={<WalletSettings />} exact />
                        <Route path={PopupRoutes.WalletRename} children={<WalletRename />} exact />
                        <Route path={PopupRoutes.DeleteWallet} children={<DeleteWallet />} exact />
                        <Route path={PopupRoutes.CreateWallet} children={<CreateWallet />} exact />
                        <Route path={PopupRoutes.SwitchWallet} children={<SwitchWallet />} exact />
                        <Route path={PopupRoutes.BackupWallet} children={<BackupWallet />} exact />
                        <Route path={PopupRoutes.AddToken} children={<AddToken />} exact />
                        <Route path={PopupRoutes.WalletSignRequest} children={<SignRequest />} />
                        <Route path={PopupRoutes.GasSetting} children={<GasSetting />} />
                        <Route path={PopupRoutes.TokenDetail} children={<TokenDetail />} exact />
                        <Route path={PopupRoutes.Transfer} children={<Transfer />} exact />
                        <Route path={PopupRoutes.ContractInteraction} children={<ContractInteraction />} />
                        <Route path={PopupRoutes.SelectWallet} children={<SelectWallet />} />
                        <Route path={PopupRoutes.Unlock} children={<Unlock />} />
                        <Route path={PopupRoutes.SetPaymentPassword} children={<SetPaymentPassword />} exact />
                        <Route path={PopupRoutes.ReplaceTransaction} children={<ReplaceTransaction />} exact />
                    </Switch>
                )}
            </WalletContext.Provider>
        </Suspense>
    )
}
