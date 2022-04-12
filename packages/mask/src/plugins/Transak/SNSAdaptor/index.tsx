import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
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
            RenderEntryComponent({ disabled, AppIcon, title }) {
                const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                return <ApplicationEntry title={title} AppIcon={AppIcon} disabled={disabled} onClick={openDialog} />
            },
            appBoardSortingDefaultPriority: 10,
            marketListSortingPriority: 6,
            tutorialLink: 'https://transak.com/',
            AppIcon: <TransakIcon />,
            description: { i18nKey: 'plugin_transak_description', fallback: '' },
            name: { i18nKey: 'plugin_transak_name', fallback: 'Fiat On-Ramp' },
            category: 'dapp',
        },
    ],
}

export default sns
