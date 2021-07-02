import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { SelectTokenDialog } from './SelectTokenDialog'
import { GasNowDialog } from './GasNowDialog'
import { CreateWalletDialog } from './CreateWalletDialog'
import { CreateImportChooseDialog } from './CreateImportChooseDialog'
import { ImportWalletDialog } from './ImportWalletDialog'
import { SelectProviderDialog } from './SelectProviderDialog'
import { SelectWalletDialog } from './SelectWalletDialog'
import { WalletConnectQRCodeDialog } from './WalletConnectQRCodeDialog'
import { WalletStatusDialog } from './WalletStatusDialog'
import { WalletRenameWalletDialog } from './RenameWalletDialog'
import { TransactionDialog } from './TransactionDialog'
import { ConnectWalletDialog } from './ConnectWalletDialog'
import { useStartWatchChainState } from '../hooks/useStartWatchChainState'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        useStartWatchChainState()
        return (
            <>
                <TransactionDialog />
                <SelectWalletDialog />
                <SelectProviderDialog />
                <SelectTokenDialog />
                <GasNowDialog />
                <CreateWalletDialog />
                <CreateImportChooseDialog />
                <ImportWalletDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletConnectQRCodeDialog />
                <WalletRenameWalletDialog />
            </>
        )
    },
}

export default sns
