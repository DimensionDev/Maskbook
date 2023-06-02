import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { Modals } from '@masknet/web3-modals'
import { ExtensionSite, getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog/index.js'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog/index.js'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog/index.js'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog/index.js'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <SelectProviderDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <Modals />
            </>
        )
    },
}

export default dashboard
