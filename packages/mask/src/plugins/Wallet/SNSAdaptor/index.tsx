import { getEnumAsArray } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { ConnectWalletDialog } from './ConnectWalletDialog/index.js'
import { GasSettingDialog } from './GasSettingDialog/index.js'
import { TransactionSnackbar } from './TransactionSnackbar/index.js'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog.js'
import { Modals } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <ApplicationBoardDialog />
                <ConnectWalletDialog />
                <GasSettingDialog />
                {getEnumAsArray(NetworkPluginID).map(({ key, value: pluginID }) => (
                    <TransactionSnackbar key={key} pluginID={pluginID} />
                ))}
                <Modals />
            </>
        )
    },
}

export default sns
