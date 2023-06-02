import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PluginPetMessages } from '../messages.js'
import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PetsGlobalInjection } from './PetsGlobalInjection.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection: PetsGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Pets size={36} />
            const name = <Trans i18nKey="plugin_pets_name" />
            const iconFilterColor = 'rgba(226, 0, 233, 0.2)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const { openDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)

                    return (
                        <ApplicationEntry
                            {...EntryComponentProps}
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(openDialog)
                                    : openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 13,
                marketListSortingPriority: 13,
                icon,
                description: <Trans i18nKey="plugin_pets_description" />,
                name,
                tutorialLink: 'https://twitter.com/NonFFriend',
                iconFilterColor,
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
