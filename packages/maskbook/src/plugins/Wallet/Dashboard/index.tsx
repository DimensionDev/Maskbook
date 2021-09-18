import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectTokenDialog } from '../SNSAdaptor/SelectTokenDialog'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog'
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
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog'
import { RRC20TokenListDialog } from '../SNSAdaptor/RRC20TokenListDialog'

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
                <SelectNftContractDialog />
                <CreateWalletDialog />
                <CreateImportChooseDialog />
                <ImportWalletDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletConnectQRCodeDialog />
                <WalletRenameWalletDialog />
                <WalletRiskWarningDialog />
                <RRC20TokenListDialog />
                <GasSettingDialog />
            </>
        )
    },
}

export default dashboard
