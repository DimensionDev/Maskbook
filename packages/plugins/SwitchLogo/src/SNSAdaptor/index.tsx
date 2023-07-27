import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { SNSAdaptorPluginContext } from '@masknet/web3-providers'
import { PluginID, SwitchLogoType } from '@masknet/shared-base'
import { SwitchLogoDialog } from './SwitchLogoDialog.js'
import { setupStorage } from './storage.js'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'

const recommendFeature = {
    description: <Trans i18nKey="description" ns={PluginID.SwitchLogo} />,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        SNSAdaptorPluginContext.setup(context)

        const storage = context.createKVStorage('persistent', { value: { default: SwitchLogoType.New } })
        setupStorage(storage)
    },
    GlobalInjection() {
        return (
            <SNSAdaptorContext.Provider value={SNSAdaptorPluginContext.context}>
                <SwitchLogoDialog />
            </SNSAdaptorContext.Provider>
        )
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 10,
            icon: <Icons.TwitterColored size={36} />,
            name: <Trans ns={PluginID.SwitchLogo} i18nKey="title" />,
            category: 'dapp',
            recommendFeature,
            description: recommendFeature.description,
        },
    ],
}

export default sns
