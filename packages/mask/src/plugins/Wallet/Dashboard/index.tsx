import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectTokenDialog } from '../SNSAdaptor/SelectTokenDialog'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog'
import { SelectWalletDialog } from '../SNSAdaptor/SelectWalletDialog'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog'
import { WalletRenameWalletDialog } from '../SNSAdaptor/RenameWalletDialog'
import { TransactionDialog } from '../SNSAdaptor/TransactionDialog'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar'
import { RestoreLegacyWalletDialog } from '../SNSAdaptor/RestoreLegacyWalletDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <TransactionDialog />
                <SelectWalletDialog />
                <SelectProviderDialog />
                <SelectTokenDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog isDashboard />
                <ConnectWalletDialog />
                <WalletConnectQRCodeDialog />
                <WalletRenameWalletDialog />
                <WalletRiskWarningDialog />
                <RestoreLegacyWalletDialog />
                <SelectTokenDialog />
                <GasSettingDialog />
                <TransactionSnackbar />
            </>
        )
    },
}

export default dashboard
