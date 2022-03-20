import { WalletStartUp } from './components/StartUp'
import { EthereumRpcType, useWallet } from '@masknet/web3-shared-evm'
import { WalletAssets } from './components/WalletAssets'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { WalletContext } from './hooks/useWalletContext'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'
import { useAsyncRetry } from 'react-use'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages'
import Services from '../../../service'
import SelectWallet from './SelectWallet'
import { useWalletLockStatus } from './hooks/useWalletLockStatus'
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

const r = relativeRouteOf(PopupRoutes.Wallet)
export default function Wallet() {
    const wallet = useWallet()
    const location = useLocation()
    const navigate = useNavigate()

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
                case EthereumRpcType.SIGN_TYPED_DATA:
                    navigate(PopupRoutes.WalletSignRequest, { replace: true })
                    break
                case EthereumRpcType.CONTRACT_INTERACTION:
                case EthereumRpcType.SEND_ETHER:
                    navigate(PopupRoutes.ContractInteraction, { replace: true })
                    break
                default:
                    break
            }
        }
    }, [location.search, location.pathname])

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
                    </Routes>
                )}
            </WalletContext.Provider>
        </Suspense>
    )
}
