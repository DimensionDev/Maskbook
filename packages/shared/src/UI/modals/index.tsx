import { memo } from 'react'
import { RootWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { WalletRiskWarningModal } from './WalletRiskWarningModal/index.js'
import { TransactionConfirmModal } from './TokenTransactionConfirmModal/index.js'
import { SelectNonFungibleContractModal } from './SelectNonFungibleContractModal/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export interface ModalProps {
    createWallet(): void
}
export const Modals = memo(function Modals(props: ModalProps) {
    return (
        <RootWeb3ContextProvider>
            <WalletRiskWarningModal ref={modals.WalletRiskWarningModal.register} />
            <TransactionConfirmModal ref={modals.TransactionConfirmModal.register} />
            <SelectNonFungibleContractModal ref={modals.SelectNonFungibleContractModal.register} />
        </RootWeb3ContextProvider>
    )
})
