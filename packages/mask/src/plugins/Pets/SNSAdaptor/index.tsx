import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import AnimatePic from './Animate'
import { PetDialog } from './PetDialog'
import { PluginPetMessages } from '../messages'
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
        {
            RenderEntryComponent({ disabled }) {
                const { openDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)

                return (
                    <ApplicationEntry
                        disabled={disabled}
                        title="Non-F Friends"
                        icon={new URL('../assets/mintTeam.png', import.meta.url).toString()}
                        onClick={openDialog}
                    />
                )
            },
            defaultSortingPriority: 10,
        },
    ],
}

export default sns
