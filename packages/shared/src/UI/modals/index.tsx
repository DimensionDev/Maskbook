import { memo } from 'react'
import { NetworkPluginID } from '@masknet/shared-base'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { WalletStatusModal } from './WalletStatusModal/index.js'
import { SelectProviderModal } from './SelectProviderModal/index.js'
import { WalletRiskWarningModal } from './WalletRiskWarningModal/index.js'
import { ConnectWalletModal } from './ConnectWalletModal/index.js'
import { TransactionSnackbarModal } from './TransactionSnackbar/index.js'
import { TransactionConfirmModal } from './TokenTransactionConfirmModal/index.js'
import { SelectFungibleTokenModal } from './SelectFungibleTokenModal/index.js'
import { SelectGasSettingsModal } from './SelectAdvancedSettingsDialog/index.js'
import { SelectNonFungibleContractModal } from './SelectNonFungibleContractModal/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export interface ModalProps {
    createWallet(): void
}
export const Modals = memo(function Modals(props: ModalProps) {
    return (
        <RootWeb3ContextProvider>
            <ConnectWalletModal ref={modals.ConnectWalletModal.register} />
            <SelectProviderModal createWallet={props.createWallet} ref={modals.SelectProviderModal.register} />
            <WalletStatusModal ref={modals.WalletStatusModal.register} />
            <WalletRiskWarningModal ref={modals.WalletRiskWarningModal.register} />
            <TransactionSnackbarModal pluginID={NetworkPluginID.PLUGIN_EVM} ref={modals.TransactionSnackbar.register} />
            <TransactionConfirmModal ref={modals.TransactionConfirmModal.register} />
            <SelectGasSettingsModal ref={modals.SelectGasSettingsModal.register} />
            <SelectFungibleTokenModal ref={modals.SelectFungibleTokenModal.register} />
            <SelectNonFungibleContractModal ref={modals.SelectNonFungibleContractModal.register} />
        </RootWeb3ContextProvider>
    )
})
