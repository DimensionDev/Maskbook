import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry, useRemoteControlledDialog } from '@masknet/shared'
import { base } from '../base.js'
import { PluginTransakMessages } from '../messages.js'
import { BuyTokenGlobalInjection } from './BuyTokenGlobalInjection.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: BuyTokenGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Transak size={36} />
            const name = <Trans i18nKey="plugin_transak_name" />
            const iconFilterColor = 'rgba(69, 110, 255, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                    return (
                        <ApplicationEntry
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            {...EntryComponentProps}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(openDialog)
                                    : openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 8,
                marketListSortingPriority: 6,
                tutorialLink: 'https://transak.com/',
                icon,
                description: <Trans i18nKey="plugin_transak_description" />,
                name,
                category: 'dapp',
                iconFilterColor,
            }
        })(),
    ],
}

export default sns
