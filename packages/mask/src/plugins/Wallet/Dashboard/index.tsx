import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog'
import { TransactionDialog } from '../SNSAdaptor/TransactionDialog'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <SelectProviderDialog />
                <TransactionDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                <TransactionSnackbar />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}

export default dashboard
