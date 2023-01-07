import urlcat from 'urlcat'
import { first } from 'lodash-es'
import { lazy, Suspense, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { NetworkPluginID, PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { useChainContext, useWallet, useWallets, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { TransactionDescriptorType } from '@masknet/web3-shared-base'
import { EthereumMethodType, getDefaultChainId, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { WalletStartUp } from './components/StartUp/index.js'
import { WalletAssets } from './components/WalletAssets/index.js'
import { WalletContext } from './hooks/useWalletContext.js'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages.js'
import SelectWallet from './SelectWallet/index.js'
import { useWalletLockStatus } from './hooks/useWalletLockStatus.js'
import { WalletHeader } from './components/WalletHeader/index.js'
import { PopupContext } from '../../hook/usePopupContext.js'

const ImportWallet = lazy(() => import('./ImportWallet/index.js'))
const AddDeriveWallet = lazy(() => import('./AddDeriveWallet/index.js'))
const WalletSettings = lazy(() => import('./WalletSettings/index.js'))
const WalletRename = lazy(() => import('./WalletRename/index.js'))
const DeleteWallet = lazy(() => import('./DeleteWallet/index.js'))
const CreateWallet = lazy(() => import('./CreateWallet/index.js'))
const SwitchWallet = lazy(() => import('./SwitchWallet/index.js'))
const BackupWallet = lazy(() => import('./BackupWallet/index.js'))
const AddToken = lazy(() => import('./AddToken/index.js'))
const TokenDetail = lazy(() => import('./TokenDetail/index.js'))
const SignRequest = lazy(() => import('./SignRequest/index.js'))
const GasSetting = lazy(() => import('./GasSetting/index.js'))
const Transfer = lazy(() => import('./Transfer/index.js'))
const ContractInteraction = lazy(() => import('./ContractInteraction/index.js'))
const Unlock = lazy(() => import('./Unlock/index.js'))
const SetPaymentPassword = lazy(() => import('./SetPaymentPassword/index.js'))
const WalletRecovery = lazy(() => import('./WalletRecovery/index.js'))
const LegacyWalletRecovery = lazy(() => import('./LegacyWalletRecovery/index.js'))
const ReplaceTransaction = lazy(() => import('./ReplaceTransaction/index.js'))
const CreatePassword = lazy(() => import('./CreatePassword/index.js'))
const ChangeOwner = lazy(() => import('./ChangeOwner/index.js'))

const exclusionDetectLocked = [PopupRoutes.Unlock]

const r = relativeRouteOf(PopupRoutes.Wallet)

export default function Wallet() {
    const wallet = useWallet()
    const wallets = useWallets()
    const location = useLocation()
    const navigate = useNavigate()
    const connection = useWeb3Connection()
    const { smartPayChainId } = PopupContext.useContainer()
    const { chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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

        if (payload) {
            switch (payload.method) {
                case EthereumMethodType.ETH_SIGN:
                case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                case EthereumMethodType.PERSONAL_SIGN:
                    navigate(PopupRoutes.WalletSignRequest, { replace: true })
                    break
                case EthereumMethodType.MASK_DEPLOY:
                    navigate(PopupRoutes.ContractInteraction, { replace: true })
                    break
                default:
                    break
            }
        }

        const computedPayload = PayloadEditor.fromPayload(payload)
        if (!computedPayload.config) return

        const formatterTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload.config)

        console.log(formatterTransaction)
        if (
            formatterTransaction &&
            [TransactionDescriptorType.INTERACTION, TransactionDescriptorType.TRANSFER].includes(
                formatterTransaction.type,
            )
        ) {
            navigate(PopupRoutes.ContractInteraction, { replace: true })
        }
    }, [location.search, location.pathname, chainId])

    useEffect(() => {
        if (!(isLocked && !getLockStatusLoading && !exclusionDetectLocked.some((x) => x === location.pathname))) return
        navigate(urlcat(PopupRoutes.Unlock, { from: location.pathname }), { replace: true })
    }, [isLocked, location.pathname, getLockStatusLoading])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(({ hasRequest }) => {
            if (hasRequest) retry()
        })
    }, [retry])

    useEffect(() => {
        if (!wallet && wallets.length) {
            connection?.connect({
                account: first(wallets)?.address,
                chainId: getDefaultChainId(),
                providerType: ProviderType.MaskWallet,
            })
        } else if (wallet?.owner && smartPayChainId) {
            setChainId(smartPayChainId)
        }
    }, [wallet, wallets, connection, smartPayChainId])

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
                        <Route path={r(PopupRoutes.CreatePassword)} element={<CreatePassword />} />
                        <Route path={r(PopupRoutes.ChangeOwner)} element={<ChangeOwner />} />
                    </Routes>
                )}
            </WalletContext.Provider>
        </Suspense>
    )
}
