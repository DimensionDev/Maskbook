import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { RestorableScrollContext } from '@masknet/shared'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { EditNetwork } from './EditNetwork/index.js'
import { NetworkManagement } from './NetworkManagement/index.js'
import SelectWallet from './SelectWallet/index.js'
import { WalletAssets } from './components/WalletAssets/index.js'

import TokenDetail from './TokenDetail/index.js'
import { TransactionDetail } from './TransactionDetail/index.js'
import { CollectibleDetail } from './CollectibleDetail/index.js'
import { WalletGuard } from './WalletGuard/index.js'
import { NoWalletGuard } from './NoWalletGuard/index.js'

const WalletSettings = lazy(() => import('./WalletSettings/index.js'))
const CreateWallet = lazy(() => import('./CreateWallet/index.js'))
const DeriveWallet = lazy(() => import('./CreateWallet/Derive.js'))
const AddToken = lazy(() => import('./AddToken/index.js'))
const GasSetting = lazy(() => import('./GasSetting/index.js'))
const Transfer = lazy(() => import('./Transfer/index.js'))
const ContactList = lazy(() => import('./ContactList/index.js'))
const ContractInteraction = lazy(() => import('./Interaction/index.js'))
const Unlock = lazy(() => import('./Unlock/index.js'))
const ResetWallet = lazy(() => import('./ResetWallet/index.js'))
const SetPaymentPassword = lazy(() => import('./SetPaymentPassword/index.js'))
const ChangeOwner = lazy(() => import('./ChangeOwner/index.js'))
const Receive = lazy(() => import('./Receive/index.js'))
const ExportPrivateKey = lazy(() => import('./ExportPrivateKey/index.js'))
const ConnectedSites = lazy(() => import('./ConnectedSites/index.js'))

const r = relativeRouteOf(PopupRoutes.Wallet)

export default function Wallet() {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <RestorableScrollContext.Provider>
                <Routes>
                    <Route path="/" element={<WalletGuard />}>
                        <Route index element={<WalletAssets />} />
                        <Route path={r(PopupRoutes.WalletSettings)} element={<WalletSettings />} />
                        <Route path={r(PopupRoutes.CreateWallet)} element={<CreateWallet />} />
                        <Route path={r(PopupRoutes.DeriveWallet)} element={<DeriveWallet />} />
                        <Route path={r(`${PopupRoutes.Contacts}/:address?` as PopupRoutes)} element={<ContactList />} />
                        <Route
                            path={r(`${PopupRoutes.AddToken}/:chainId/:assetType` as PopupRoutes)}
                            element={<AddToken />}
                        />
                        <Route path={r(PopupRoutes.GasSetting)} element={<GasSetting />} />
                        <Route path={r(PopupRoutes.Transfer)} element={<Transfer />} />
                        <Route path={r(PopupRoutes.ContractInteraction)} element={<ContractInteraction />} />
                        <Route path={r(PopupRoutes.SelectWallet)} element={<SelectWallet />} />
                        <Route path={r(PopupRoutes.Unlock)} element={<Unlock />} />
                        <Route path={r(PopupRoutes.ResetWallet)} element={<ResetWallet />} />
                        <Route path={r(PopupRoutes.SetPaymentPassword)} element={<SetPaymentPassword />} />
                        <Route path={r(PopupRoutes.ChangeOwner)} element={<ChangeOwner />} />
                        <Route path={r(PopupRoutes.NetworkManagement)} element={<NetworkManagement />} />
                        <Route path={r(PopupRoutes.AddNetwork)} element={<EditNetwork />} />
                        <Route path={r(`${PopupRoutes.EditNetwork}/:id?` as PopupRoutes)} element={<EditNetwork />} />
                        <Route path={r(PopupRoutes.Receive)} element={<Receive />} />
                        <Route path={r(PopupRoutes.ExportWalletPrivateKey)} element={<ExportPrivateKey />} />
                        <Route path={r(PopupRoutes.ConnectedSites)} element={<ConnectedSites />} />
                        <Route path="*" element={<Navigate to={PopupRoutes.Wallet} />} />
                    </Route>
                    <Route path="*" element={<NoWalletGuard />}>
                        <Route path={r(PopupRoutes.TokenDetail)} element={<TokenDetail />} />
                        <Route path={r(PopupRoutes.TransactionDetail)} element={<TransactionDetail />} />
                        <Route path={r(PopupRoutes.CollectibleDetail)} element={<CollectibleDetail />} />
                    </Route>
                </Routes>
            </RestorableScrollContext.Provider>
        </Suspense>
    )
}
