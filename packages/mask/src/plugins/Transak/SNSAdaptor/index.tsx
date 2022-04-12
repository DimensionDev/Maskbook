import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { Trans } from 'react-i18next'
import { BuyTokenDialog } from './BuyTokenDialog'
import { PluginTransakMessages } from '../messages'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'
import { TransakIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, icon, title }) {
                const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                return <ApplicationEntry title={title} icon={icon} disabled={disabled} onClick={openDialog} />
            },
            appBoardSortingDefaultPriority: 10,
            marketListSortingPriority: 6,
            tutorialLink: 'https://transak.com/',
            icon: <TransakIcon />,
            description: <Trans i18nKey="plugin_transak_description" />,
            name: <Trans i18nKey="plugin_transak_name" />,
            category: 'dapp',
        },
    ],
}

export default sns
