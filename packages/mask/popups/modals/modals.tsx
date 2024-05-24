import { PopupModalRoutes } from '@masknet/shared-base'
import { Route, Routes } from 'react-router-dom'
import { wrapModal } from '../components/index.js'
import { ChangeBackupPasswordModal } from './ChangeBackupPasswordModal/index.js'
import { ChooseCurrencyModal } from './ChooseCurrencyModal/index.js'
import { ChooseNetworkModal } from './ChooseNetworkModal/index.js'
import { ConnectProviderModal } from './ConnectProvider/index.js'
import { ConnectSocialAccountModal } from './ConnectSocialAccountModal/index.js'
import { PersonaRenameModal } from './PersonaRenameModal/index.js'
import { PersonaSettingModal } from './PersonaSettingModal/index.js'
import { SelectAppearanceModal } from './SelectAppearanceModal/index.js'
import { SelectLanguageModal } from './SelectLanguageModal/index.js'
import { SetBackupPasswordModal } from './SetBackupPasswordModal/index.js'
import { SupportedSitesModal } from './SupportedSitesModal/index.js'
import { SwitchPersonaModal } from './SwitchPersonaModal/index.js'
import { VerifyBackupPasswordModal } from './VerifyBackupPasswordModal/index.js'
import { WalletGroupModal } from './WalletGroupModal/index.js'
import SwitchWallet from '../pages/Wallet/SwitchWallet/index.js'
import { SelectProviderModal } from './SelectProviderModal/index.js'
import { UpdatePermissionModal } from './UpdatePermissionModal/index.js'

export default function RoutedModals(props: { path: string }) {
    return (
        <Routes location={props.path}>
            <Route path={PopupModalRoutes.verifyBackupPassword} element={wrapModal(<VerifyBackupPasswordModal />)} />
            <Route path={PopupModalRoutes.SetBackupPassword} element={wrapModal(<SetBackupPasswordModal />)} />
            <Route path={PopupModalRoutes.PersonaRename} element={wrapModal(<PersonaRenameModal />)} />
            <Route path={PopupModalRoutes.PersonaSettings} element={wrapModal(<PersonaSettingModal />)} />
            <Route path={PopupModalRoutes.UpdatePermissions} element={wrapModal(<UpdatePermissionModal />)} />
            <Route path={PopupModalRoutes.SwitchPersona} element={wrapModal(<SwitchPersonaModal />)} />
            <Route path={PopupModalRoutes.ChooseCurrency} element={wrapModal(<ChooseCurrencyModal />)} />
            <Route path={PopupModalRoutes.ChooseNetwork} element={wrapModal(<ChooseNetworkModal />)} />
            <Route path={PopupModalRoutes.SwitchWallet} element={wrapModal(<SwitchWallet />)} />
            <Route path={PopupModalRoutes.ConnectSocialAccount} element={wrapModal(<ConnectSocialAccountModal />)} />
            <Route path={PopupModalRoutes.SelectProvider} element={wrapModal(<SelectProviderModal />)} />
            <Route path={PopupModalRoutes.ConnectProvider} element={wrapModal(<ConnectProviderModal />)} />
            <Route path={PopupModalRoutes.WalletAccount} element={wrapModal(<WalletGroupModal />)} />
            <Route path={PopupModalRoutes.SelectLanguage} element={wrapModal(<SelectLanguageModal />)} />
            <Route path={PopupModalRoutes.SelectAppearance} element={wrapModal(<SelectAppearanceModal />)} />
            <Route path={PopupModalRoutes.SupportedSitesModal} element={wrapModal(<SupportedSitesModal />)} />
            <Route path={PopupModalRoutes.ChangeBackupPassword} element={wrapModal(<ChangeBackupPasswordModal />)} />
        </Routes>
    )
}
