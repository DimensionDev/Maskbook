import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { SelectTokenDialog } from '../SNSAdaptor/SelectTokenDialog'
import { GasNowDialog } from '../SNSAdaptor/GasNowDialog'
import { CreateWalletDialog } from '../SNSAdaptor/CreateWalletDialog'
import { CreateImportChooseDialog } from '../SNSAdaptor/CreateImportChooseDialog'
import { ImportWalletDialog } from '../SNSAdaptor/ImportWalletDialog'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog'
import { SelectWalletDialog } from '../SNSAdaptor/SelectWalletDialog'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog'
import { WalletRenameWalletDialog } from '../SNSAdaptor/RenameWalletDialog'
import { TransactionDialog } from '../SNSAdaptor/TransactionDialog'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog'
import { useStartWatchChainState } from '../hooks/useStartWatchChainState'

const dashboard: Plugin.Dashboard.Definition = {
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

export default dashboard
