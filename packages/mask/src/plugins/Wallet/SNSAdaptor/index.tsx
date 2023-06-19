import { getEnumAsArray } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { GasSettingDialog } from './GasSettingDialog/index.js'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog.js'
import { Modals, TransactionSnackbar } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <ApplicationBoardDialog />
                <GasSettingDialog />
                {getEnumAsArray(NetworkPluginID).map(({ key, value: pluginID }) =>
                    TransactionSnackbar.open({ pluginID }),
                )}
                <Modals />
            </>
        )
    },
}

export default sns
