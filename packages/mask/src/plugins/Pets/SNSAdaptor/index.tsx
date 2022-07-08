import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import AnimatePic from './Animate'
import { PetDialog } from './PetDialog'
import { PluginPetMessages } from '../messages'
import { Trans } from 'react-i18next'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <>
                <AnimatePic />
                <PetDialog />
            </>
        )
    },
    ApplicationEntries: [
        (() => {
            const icon = <img src={new URL('../assets/pets.png', import.meta.url).toString()} />
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
                appBoardSortingDefaultPriority: 12,
                marketListSortingPriority: 12,
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
