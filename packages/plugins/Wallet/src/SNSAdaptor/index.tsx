import { getEnumAsArray } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { SelectNftContractDialog } from './SelectNftContractDialog/index.js'
import { WalletStatusDialog } from './WalletStatusDialog/index.js'
import { ConnectWalletDialog } from './ConnectWalletDialog/index.js'
import { WalletRiskWarningDialog } from './RiskWarningDialog/index.js'
import { GasSettingDialog } from './GasSettingDialog/index.js'
import { TransactionSnackbar } from './TransactionSnackbar/index.js'
import { WalletConnectQRCodeDialog } from './WalletConnectQRCodeDialog/index.js'
import { SharedContextSettings } from '../settings.js'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { PluginSelectProviderDialog } from './PluginSelectProviderDialog/index.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        SharedContextSettings.value = context
    },
    GlobalInjection() {
        return (
            <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
                <PluginSelectProviderDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getEnumAsArray(NetworkPluginID).map(({ key, value: pluginID }) => (
                    <TransactionSnackbar key={key} pluginID={pluginID} />
                ))}
                <WalletConnectQRCodeDialog />
            </SNSAdaptorContext.Provider>
        )
    },
}

export default sns

export * from './Components/index.js'
