import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { PluginID } from '@masknet/shared-base'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { SwitchLogoDialog } from './SwitchLogoDialog.js'
import { setupStorage } from './storage.js'

const recommendFeature = {
    description: <Trans i18nKey="description" ns={PluginID.SwitchLogo} />,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('persistent', {}).createSubScope('SwitchLogo', { value: {} }))
    },
    GlobalInjection() {
        return <SwitchLogoDialog />
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
