import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectNftContractDialog } from './SelectNftContractDialog'
import { SelectProviderDialog } from './SelectProviderDialog'
import { WalletStatusDialog } from './WalletStatusDialog'
import { TransactionDialog } from './TransactionDialog'
import { ConnectWalletDialog } from './ConnectWalletDialog'
import { WalletRiskWarningDialog } from './RiskWarningDialog'
import { GasSettingDialog } from './GasSettingDialog'
import { TransactionSnackbar } from './TransactionSnackbar'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <TransactionDialog />
                <SelectProviderDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog />
                <ApplicationBoardDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                <TransactionSnackbar />
            </>
        )
    },
}

export default sns
