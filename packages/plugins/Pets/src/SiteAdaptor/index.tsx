import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { PluginPetMessages } from '../messages.js'
import { PetsGlobalInjection } from './PetsGlobalInjection.js'
import { twitterDomainMigrate } from '@masknet/shared-base'
import { usePetsTrans } from '../locales/i18n_generated.js'

function Name() {
    const t = usePetsTrans()
    return t.plugin_pets_name()
}
function Desc() {
    const t = usePetsTrans()
    return t.plugin_pets_description()
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection: PetsGlobalInjection,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Pets size={36} />
            const name = <Name />
            const iconFilterColor = 'rgba(226, 0, 233, 0.2)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const { openDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated)

                    return (
                        <ApplicationEntry
                            {...EntryComponentProps}
                            title={name}
                            icon={icon}
                            iconFilterColor={iconFilterColor}
                            onClick={
                                EntryComponentProps.onClick ?
                                    () => EntryComponentProps.onClick?.(openDialog)
                                :   openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 13,
                marketListSortingPriority: 13,
                icon,
                description: <Desc />,
                name,
                tutorialLink: twitterDomainMigrate('https://x.com/NonFFriend'),
                iconFilterColor,
                category: 'dapp',
            }
        })(),
    ],
}

export default site
