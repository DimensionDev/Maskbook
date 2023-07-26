import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_ID } from '../constants.js'
import { PluginID } from '@masknet/shared-base'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { SwitchLogoDialog } from './SwitchLogoDialog.js'
import { LogoSwitcher } from './LogoSwitcher.js'

const recommendFeature = {
    description: <Trans i18nKey="title" ns={PluginID.SwitchLogo} />,
    backgroundGradient: 'linear-gradient(360deg, #FFECD2 -0.43%, #FCB69F 99.57%)',
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    GlobalInjection() {
        return (
            <>
                <SwitchLogoDialog />
                <LogoSwitcher />
            </>
        )
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: PLUGIN_ID,
            appBoardSortingDefaultPriority: 10,
            icon: <Icons.Twitter3 size={36} />,
            name: <Trans ns={PluginID.SwitchLogo} i18nKey="title" />,
            category: 'dapp',
            recommendFeature,
        },
    ],
}

export default sns
