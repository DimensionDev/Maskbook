import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog'
import { TransactionDialog } from '../SNSAdaptor/TransactionDialog'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog'
import { ExtensionSite, getSiteType } from '@masknet/shared-base'

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
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}

export default dashboard
