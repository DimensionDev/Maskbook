import { WalletStartUp } from './components/StartUp'
import { WalletAssets } from './components/WalletAssets'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { WalletContext } from './hooks/useWalletContext'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'
import { useAsyncRetry } from 'react-use'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages'
import SelectWallet from './SelectWallet'
import { useWalletLockStatus } from './hooks/useWalletLockStatus'
import urlcat from 'urlcat'
import { WalletHeader } from './components/WalletHeader'
import { useChainId, useWallet, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, TransactionDescriptorType } from '@masknet/web3-shared-base'
import { EthereumMethodType, getPayloadConfig } from '@masknet/web3-shared-evm'

const ImportWallet = lazy(() => import('./ImportWallet'))
const AddDeriveWallet = lazy(() => import('./AddDeriveWallet'))
const WalletSettings = lazy(() => import('./WalletSettings'))
const WalletRename = lazy(() => import('./WalletRename'))
const DeleteWallet = lazy(() => import('./DeleteWallet'))
const CreateWallet = lazy(() => import('./CreateWallet'))
const SwitchWallet = lazy(() => import(/* webpackPrefetch: true */ './SwitchWallet'))
const BackupWallet = lazy(() => import('./BackupWallet'))
const AddToken = lazy(() => import('./AddToken'))
const TokenDetail = lazy(() => import(/* webpackPrefetch: true */ './TokenDetail'))
const SignRequest = lazy(() => import(/* webpackPrefetch: true */ './SignRequest'))
const GasSetting = lazy(() => import(/* webpackPrefetch: true */ './GasSetting'))
const Transfer = lazy(() => import(/* webpackPrefetch: true */ './Transfer'))
const ContractInteraction = lazy(() => import(/* webpackPrefetch: true */ './ContractInteraction'))
const Unlock = lazy(() => import(/* webpackPreload: true */ './Unlock'))
const SetPaymentPassword = lazy(() => import('./SetPaymentPassword'))
const WalletRecovery = lazy(() => import('./WalletRecovery'))
const LegacyWalletRecovery = lazy(() => import('./LegacyWalletRecovery'))
const ReplaceTransaction = lazy(() => import('./ReplaceTransaction'))
const ConnectWallet = lazy(() => import('./ConnectWallet'))

const r = relativeRouteOf(PopupRoutes.Wallet)
export default function Wallet() {
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const location = useLocation()
    const navigate = useNavigate()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
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
        const computedPayload = getPayloadConfig(payload)
        if (!computedPayload) return

        const formatterTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)

        if (
            formatterTransaction &&
            [TransactionDescriptorType.INTERACTION, TransactionDescriptorType.TRANSFER].includes(
                formatterTransaction.type,
            )
        ) {
            navigate(PopupRoutes.ContractInteraction, { replace: true })
        }

        if (computedPayload) {
            switch (payload.method) {
                case EthereumMethodType.ETH_SIGN:
                case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                    navigate(PopupRoutes.WalletSignRequest, { replace: true })
                    break
                default:
                    break
            }
        }
    }, [location.search, location.pathname, chainId])

    useEffect(() => {
        if (!(isLocked && !getLockStatusLoading && location.pathname !== PopupRoutes.Unlock)) return
        navigate(urlcat(PopupRoutes.Unlock, { from: location.pathname }), { replace: true })
    }, [isLocked, location.pathname, getLockStatusLoading])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(({ hasRequest }) => {
            if (hasRequest) retry()
        })
    }, [retry])

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <WalletContext.Provider>
                <WalletHeader />
                {loading ? (
                    <LoadingPlaceholder />
                ) : (
                    <Routes>
                        <Route path="*" element={!wallet ? <WalletStartUp /> : <WalletAssets />} />
                        <Route path={r(PopupRoutes.WalletRecovered)} element={<WalletRecovery />} />
                        <Route path={r(PopupRoutes.LegacyWalletRecovered)} element={<LegacyWalletRecovery />} />
                        <Route path={r(PopupRoutes.ImportWallet)} element={<ImportWallet />} />
                        <Route path={r(PopupRoutes.AddDeriveWallet)} element={<AddDeriveWallet />} />
                        <Route path={r(PopupRoutes.WalletSettings)} element={<WalletSettings />} />
                        <Route path={r(PopupRoutes.WalletRename)} element={<WalletRename />} />
                        <Route path={r(PopupRoutes.DeleteWallet)} element={<DeleteWallet />} />
                        <Route path={r(PopupRoutes.CreateWallet)} element={<CreateWallet />} />
                        <Route path={r(PopupRoutes.SwitchWallet)} element={<SwitchWallet />} />
                        <Route path={r(PopupRoutes.BackupWallet)} element={<BackupWallet />} />
                        <Route path={r(PopupRoutes.AddToken)} element={<AddToken />} />
                        <Route path={r(PopupRoutes.WalletSignRequest)} element={<SignRequest />} />
                        <Route path={r(PopupRoutes.GasSetting)} element={<GasSetting />} />
                        <Route path={r(PopupRoutes.TokenDetail)} element={<TokenDetail />} />
                        <Route path={r(PopupRoutes.Transfer)} element={<Transfer />} />
                        <Route path={r(PopupRoutes.ContractInteraction)} element={<ContractInteraction />} />
                        <Route path={r(PopupRoutes.SelectWallet)} element={<SelectWallet />} />
                        <Route path={r(PopupRoutes.Unlock)} element={<Unlock />} />
                        <Route path={r(PopupRoutes.SetPaymentPassword)} element={<SetPaymentPassword />} />
                        <Route path={r(PopupRoutes.ReplaceTransaction)} element={<ReplaceTransaction />} />
                        <Route path={r(PopupRoutes.ConnectWallet)} element={<ConnectWallet />} />
                    </Routes>
                )}
            </WalletContext.Provider>
        </Suspense>
    )
}
