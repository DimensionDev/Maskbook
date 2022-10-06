import type { ProfileInformation } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/social-network-infra'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { MaskMessages } from '../../../utils/messages.js'
import Services from '../../../extension/service.js'

export function InitAutonomousStateProfiles(
    signal: AbortSignal,
    ref: SocialNetworkUI.AutonomousState['profiles'],
    network: string,
) {
    query(network, ref)
    signal.addEventListener(
        'abort',
        MaskMessages.events.ownPersonaChanged.on(() => query(network, ref)),
    )

    async function query(network: string, ref: ValueRef<readonly ProfileInformation[]>) {
        const val = await Services.Identity.queryOwnedProfilesInformation(network)
        if (signal.aborted) return
        ref.value = val
    }
}
