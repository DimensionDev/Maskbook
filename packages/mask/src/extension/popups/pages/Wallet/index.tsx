import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { useWallet } from '@masknet/web3-hooks-base'
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RestorableScrollContext } from '@masknet/shared'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder/index.js'
import { EditNetwork } from './EditNetwork/index.js'
import { NetworkManagement } from './NetworkManagement/index.js'
import SelectWallet from './SelectWallet/index.js'
import { WalletStartUp } from './components/StartUp/index.js'
import { WalletAssets } from './components/WalletAssets/index.js'
import { WalletHeader } from './components/WalletHeader/index.js'

import TokenDetail from './TokenDetail/index.js'
import { TransactionDetail } from './TransactionDetail/index.js'
import { CollectibleDetail } from './CollectibleDetail/index.js'
import { WalletContext } from './hooks/index.js'

const ImportWallet = lazy(() => import('./ImportWallet/index.js'))
const AddDeriveWallet = lazy(() => import('./AddDeriveWallet/index.js'))
const WalletSettings = lazy(() => import('./WalletSettings/index.js'))
const WalletRename = lazy(() => import('./WalletRename/index.js'))
const DeleteWallet = lazy(() => import('./DeleteWallet/index.js'))
const CreateWallet = lazy(() => import('./CreateWallet/index.js'))
const BackupWallet = lazy(() => import('./BackupWallet/index.js'))
const AddToken = lazy(() => import('./AddToken/index.js'))
const GasSetting = lazy(() => import('./GasSetting/index.js'))
const Transfer = lazy(() => import('./Transfer/index.js'))
const ContactList = lazy(() => import('./ContactList/index.js'))
const ContractInteraction = lazy(() => import('./Interaction/index.js'))
const Unlock = lazy(() => import('./Unlock/index.js'))
const ResetWallet = lazy(() => import('./ResetWallet/index.js'))
const SetPaymentPassword = lazy(() => import('./SetPaymentPassword/index.js'))
const LegacyWalletRecovery = lazy(() => import('./LegacyWalletRecovery/index.js'))
const ChangeOwner = lazy(() => import('./ChangeOwner/index.js'))
const Receive = lazy(() => import('./Receive/index.js'))
const ExportPrivateKey = lazy(() => import('./ExportPrivateKey/index.js'))

const r = relativeRouteOf(PopupRoutes.Wallet)

export default function Wallet() {
    const wallet = useWallet()

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <WalletHeader />
            <RestorableScrollContext.Provider>
                <WalletContext.Provider>
                    <Routes>
                        <Route path="*" element={wallet ? <WalletAssets /> : <WalletStartUp />} />
                        <Route path={r(PopupRoutes.LegacyWalletRecovered)} element={<LegacyWalletRecovery />} />
                        <Route path={r(PopupRoutes.ImportWallet)} element={<ImportWallet />} />
                        <Route path={r(PopupRoutes.AddDeriveWallet)} element={<AddDeriveWallet />} />
                        <Route path={r(PopupRoutes.WalletSettings)} element={<WalletSettings />} />
                        <Route path={r(PopupRoutes.WalletRename)} element={<WalletRename />} />
                        <Route path={r(PopupRoutes.DeleteWallet)} element={<DeleteWallet />} />
                        <Route path={r(PopupRoutes.CreateWallet)} element={<CreateWallet />} />
                        <Route path={r(PopupRoutes.BackupWallet)} element={<BackupWallet />} />
                        <Route path={r(`${PopupRoutes.Contacts}/:address?` as PopupRoutes)} element={<ContactList />} />
                        <Route
                            path={r(`${PopupRoutes.AddToken}/:chainId/:assetType` as PopupRoutes)}
                            element={<AddToken />}
                        />
                        <Route path={r(PopupRoutes.GasSetting)} element={<GasSetting />} />
                        <Route path={r(PopupRoutes.TokenDetail)} element={<TokenDetail />} />
                        <Route path={r(PopupRoutes.TransactionDetail)} element={<TransactionDetail />} />
                        <Route path={r(PopupRoutes.CollectibleDetail)} element={<CollectibleDetail />} />
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
                    </Routes>
                </WalletContext.Provider>
            </RestorableScrollContext.Provider>
        </Suspense>
    )
}
