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
        (() => {
            const icon = <TransakIcon />
            const name = <Trans i18nKey="plugin_transak_name" />
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                    return <ApplicationEntry title={name} icon={icon} disabled={disabled} onClick={openDialog} />
                },
                appBoardSortingDefaultPriority: 10,
                marketListSortingPriority: 6,
                tutorialLink: 'https://transak.com/',
                icon,
                description: <Trans i18nKey="plugin_transak_description" />,
                name,
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
