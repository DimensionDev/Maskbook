import { getEnumAsArray } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { Modals } from '@masknet/web3-modals'
import { InjectSelectNftContractDialog } from './SelectNftContractDialog/index.js'
import { SelectProviderDialog } from './SelectProviderDialog/index.js'
import { WalletStatusDialog } from './WalletStatusDialog/index.js'
import { ConnectWalletDialog } from './ConnectWalletDialog/index.js'
import { WalletRiskWarningDialog } from './RiskWarningDialog/index.js'
import { GasSettingDialog } from './GasSettingDialog/index.js'
import { TransactionSnackbar } from './TransactionSnackbar/index.js'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog.js'
import { LeavePageConfirmDialog } from '../../../components/shared/LeavePageConfirmDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <SelectProviderDialog />
                <InjectSelectNftContractDialog />
                <WalletStatusDialog />
                <ApplicationBoardDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getEnumAsArray(NetworkPluginID).map(({ key, value: pluginID }) => (
                    <TransactionSnackbar key={key} pluginID={pluginID} />
                ))}
                <LeavePageConfirmDialog />
                <Modals />
            </>
        )
    },
}

export default sns
