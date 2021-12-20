import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectTokenDialog } from './SelectTokenDialog'
import { SelectNftContractDialog } from './SelectNftContractDialog'
import { SelectProviderDialog } from './SelectProviderDialog'
import { SelectWalletDialog } from './SelectWalletDialog'
import { WalletConnectQRCodeDialog } from './WalletConnectQRCodeDialog'
import { WalletStatusDialog } from './WalletStatusDialog'
import { WalletRenameWalletDialog } from './RenameWalletDialog'
import { TransactionDialog } from './TransactionDialog'
import { ConnectWalletDialog } from './ConnectWalletDialog'
import { useStartWatchChainState } from '../hooks/useStartWatchChainState'
import { WalletRiskWarningDialog } from './RiskWarningDialog'
import { GasSettingDialog } from './GasSettingDialog'
import { TransactionSnackbar } from './TransactionSnackbar'
import { RestoreLegacyWalletDialog } from './RestoreLegacyWalletDialog'

const sns: Plugin.SNSAdaptor.Definition = {
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
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletConnectQRCodeDialog />
                <WalletRenameWalletDialog />
                <WalletRiskWarningDialog />
                <RestoreLegacyWalletDialog />
                <GasSettingDialog />
                <TransactionSnackbar />
            </>
        )
    },
}

export default sns
