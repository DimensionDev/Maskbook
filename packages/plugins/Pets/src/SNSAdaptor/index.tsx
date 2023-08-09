import { Trans } from 'react-i18next'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { PluginPetMessages } from '../messages.js'
import { PetsGlobalInjection } from './PetsGlobalInjection.js'
import { PluginID } from '@masknet/shared-base'

const sns: Plugin.SiteAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection: PetsGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Pets size={36} />
            const name = <Trans i18nKey="plugin_pets_name" ns={PluginID.Pets} />
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
                description: <Trans i18nKey="plugin_pets_description" ns={PluginID.Pets} />,
                name,
                tutorialLink: 'https://twitter.com/NonFFriend',
                iconFilterColor,
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
