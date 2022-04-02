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
            RenderEntryComponent({ disabled, AppIcon }) {
                const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                return (
                    <ApplicationEntry title="Fiat On-Ramp" AppIcon={AppIcon} disabled={disabled} onClick={openDialog} />
                )
            },
            appBoardSortingDefaultPriority: 9,
            marketListSortingPriority: 6,
            tutorialLink: 'https://transak.com/',
            AppIcon: <TransakIcon />,
            description: 'Fiat On-Ramp Aggregator on Twitter. Buy crypto in 60+ countries with Transak support.',
            name: 'Fiat On-Ramp',
            isInDappList: true,
        },
    ],
}

export default sns
