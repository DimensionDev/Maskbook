import { Plugin, usePluginIDContext, NetworkPluginID } from '@masknet/plugin-infra'
import { useChainId } from '@masknet/web3-shared-evm'
import { activatedSocialNetworkUI } from '../../../social-network'
import { getCurrentSNSNetwork } from '../../../social-network-adaptor/utils'
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
            RenderEntryComponent(key) {
                const currentPluginId = usePluginIDContext()
                const chainId = useChainId()
                const currentSNSNetwork = getCurrentSNSNetwork(activatedSocialNetworkUI.networkIdentifier)

                const isDisabled =
                    currentPluginId !== NetworkPluginID.PLUGIN_EVM ||
                    !base.enableRequirement.web3![NetworkPluginID.PLUGIN_EVM]!.supportedChainIds!.includes(chainId) ||
                    !base.enableRequirement.networks.networks[currentSNSNetwork]

                const { openDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)

                return (
                    <div key={key}>
                        <ApplicationEntry
                            disabled={isDisabled}
                            title="Non-F Friends"
                            icon={new URL('../assets/mintTeam.png', import.meta.url).toString()}
                            onClick={openDialog}
                        />
                    </div>
                )
            },
            defaultSortingPriority: 10,
        },
    ],
}

export default sns
