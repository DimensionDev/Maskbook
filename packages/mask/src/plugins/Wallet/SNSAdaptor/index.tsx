import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectNftContractDialog } from './SelectNftContractDialog'
import { SelectProviderDialog } from './SelectProviderDialog'
import { WalletStatusDialog } from './WalletStatusDialog'
import { ConnectWalletDialog } from './ConnectWalletDialog'
import { WalletRiskWarningDialog } from './RiskWarningDialog'
import { GasSettingDialog } from './GasSettingDialog'
import { TransactionSnackbar } from './TransactionSnackbar'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog'
import { WalletConnectQRCodeDialog } from './WalletConnectQRCodeDialog'
import { getEnumAsArray } from '@dimensiondev/kit'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { LeavePageConfirmDialog } from '../../../components/shared/LeavePageConfirmDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <SelectProviderDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog />
                <ApplicationBoardDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getEnumAsArray(NetworkPluginID).map(({ key, value: pluginID }) => (
                    <TransactionSnackbar key={key} pluginID={pluginID} />
                ))}
                <WalletConnectQRCodeDialog />
                <LeavePageConfirmDialog />
            </>
        )
    },
}

export default sns
